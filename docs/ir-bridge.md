# IR Bridge Setup

The browser uses WebRTC/WHEP for the live video stream. Remote control commands
use the dashboard API because the current WHEP stream is receive-only and does
not provide a backend data channel. The control path is:

```text
Dashboard remote key -> Node backend -> USB serial -> Raspberry Pi Pico -> IR LED -> TV box / TV
```

## Files

| Purpose | Path |
|---|---|
| Pico sketch to upload | `arduino_sketches/ir_bridge_serial/ir_bridge_serial.ino` |
| Recorded remote code table | `docs/remote_ir_codes.md` |
| Persistent Pico udev rule | `udev/99-tvbox-ir-pico.rules` |
| Backend code map | `server/remote-codes.js` |
| Backend serial bridge | `server/serial-ir-bridge.js` |

## Pico Wiring

Use the transmitter wiring from the manual raw transmitter sketch.

```text
Pico GP2  -> 960R or 1k resistor -> transistor base
Pico GND  -> transistor emitter and transmitter ground
IR LED anode -> 3V3 or 5V through a current-limiting resistor
IR LED cathode -> transistor collector
```

If you use a ready-made IR transmitter module instead of a bare LED/transistor
driver, connect its signal pin to Pico `GP2`, plus VCC and GND as required by
that module. If your hardware is still wired to another GPIO, edit
`IR_SEND_PIN` at the top of `ir_bridge_serial.ino`.

## Upload The Pico Sketch

1. Open `arduino_sketches/ir_bridge_serial/ir_bridge_serial.ino` in Arduino IDE.
2. Select the Raspberry Pi Pico / RP2040 board package you used for the working
   recording and proxy sketches.
3. Upload the sketch. It uses a manual 38kHz transmitter and does not require
   the `IRremote` library.
4. Open Serial Monitor at `115200` baud and confirm it prints:

```text
READY TVBOX_IR_BRIDGE manual-raw v2
FORMAT SEND <NEC|SAMSUNG> <raw32> [repeats]
EXAMPLE SEND NEC 0x3EC1FD01 0
```

Manual serial commands:

```text
PING
SEND NEC 0x31CEFD01 0
SEND NEC 0x3EC1FD01 0
SEND SAMSUNG 0xFD020707 0
```

The Pico should reply with `OK ...` for valid commands. The backend sends the
recorded `Raw Data` value from `docs/remote_ir_codes.md`, not a generated
address/command pair.

## Stable `/dev/ir-pico`

Your Pico appears as:

```text
Bus 009 Device 005: ID 2e8a:000a Raspberry Pi Pico
```

The actual serial path is usually `/dev/ttyACM0`, `/dev/ttyACM1`, or a
`/dev/serial/by-id/...` symlink. To make it stable, install the included udev
rule on the Ubuntu host:

```bash
sudo cp udev/99-tvbox-ir-pico.rules /etc/udev/rules.d/99-tvbox-ir-pico.rules
sudo udevadm control --reload-rules
sudo udevadm trigger
ls -lah /dev/ir-pico
```

If the symlink does not appear, unplug and replug the Pico, then check:

```bash
lsusb -d 2e8a:000a
ls -lah /dev/ttyACM* /dev/serial/by-id/ 2>/dev/null
udevadm info -a -n /dev/ttyACM0 | rg 'idVendor|idProduct|serial'
```

If you own multiple Picos, add the Pico serial number to the udev rule with an
`ATTRS{serial}=="..."` match so only this board becomes `/dev/ir-pico`.

## Environment

Add these to `.env`:

```dotenv
IR_BRIDGE_ENABLED=true
IR_SERIAL_DEVICE=/dev/ir-pico
IR_SERIAL_PATH=/dev/ir-pico
IR_SERIAL_BAUD=115200
IR_SERIAL_TIMEOUT_MS=1400
IR_COMMAND_DELAY_MS=120
IR_CHANNEL_CONFIRM_COMMAND=
```

`IR_SERIAL_DEVICE` is the host path passed into Docker. `IR_SERIAL_PATH` is the
path the Node backend opens inside the dashboard container.

If your TV box needs `OK` after typed channel sequences, set:

```dotenv
IR_CHANNEL_CONFIRM_COMMAND=ok
```

For stream-only testing without the Pico connected:

```dotenv
IR_BRIDGE_ENABLED=false
IR_SERIAL_DEVICE=/dev/null
IR_SERIAL_PATH=/dev/ir-pico
```

## Start The App

Create `.env`, install the udev rule, then start Compose:

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
http://localhost:8080
```

The top status chip should show:

| Chip | Meaning |
|---|---|
| `IR Bridge Ready` | `/dev/ir-pico` is mapped and writable. |
| `IR Bridge Missing` | The backend cannot see the Pico path. Check udev and Docker device mapping. |
| `IR Bridge Stub` | `IR_BRIDGE_ENABLED=false`; commands are accepted but not sent. |

## API Checks

Status:

```bash
curl -s http://localhost:8080/api/status
```

Send a single key:

```bash
curl -s -X POST http://localhost:8080/api/remote/command \
  -H 'content-type: application/json' \
  -d '{"command":"ok","label":"OK"}'
```

Send a typed channel sequence:

```bash
curl -s -X POST http://localhost:8080/api/remote/command \
  -H 'content-type: application/json' \
  -d '{"command":"go_to_channel","label":"Channel 101","value":"101"}'
```

The backend accepts canonical command names such as `red_power_top`,
`white_power`, `tv_av`, `navigation_up`, `left_side_vol_plus`,
`right_side_ch_minus`, `number_1`, `epg`, `fav`, `red_audio`, `yellow_mail`,
`green_sub`, and `blue_media`. Common aliases like `volume_up`, `channel_down`,
`mute`, `menu`, `guide`, `subtitles`, `record`, and `forward` are also mapped.

## Troubleshooting

Check the device inside the container:

```bash
docker compose exec dashboard ls -lah /dev/ir-pico
docker compose logs dashboard
```

Test the Pico directly on the host:

```bash
printf 'PING\n' > /dev/ir-pico
```

You should see `OK PONG` or the sketch's `READY TVBOX_IR_BRIDGE manual-raw v2`
banner in the serial monitor.

If the API returns `Timed out waiting for Pico response`, confirm the uploaded
sketch is `ir_bridge_serial.ino`, the baud rate is `115200`, and no other
program such as Arduino Serial Monitor is holding the serial port open.

If the Pico replies `OK` but the TV does not react, recheck the IR LED polarity,
transistor wiring, `IR_SEND_PIN`, distance/angle, and whether the target device
expects the Samsung TV-control keys or the NEC set-top-box keys.
