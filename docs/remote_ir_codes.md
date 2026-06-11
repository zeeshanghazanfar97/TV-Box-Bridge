# TVNation Remote IR Codes

Recorded using a Raspberry Pi Pico with a TSOP1838 38kHz IR receiver.

## Hardware Setup

| Item | Value |
|---|---|
| Microcontroller | Raspberry Pi Pico / RP2040 |
| IR receiver | TSOP1838 38kHz |
| IR signal pin | `GP15` |
| Serial baud rate | `115200` |
| Receiver VCC | Pico `3V3(OUT)` |
| Receiver GND | Pico `GND` |
| Receiver OUT / S / DATA | Pico `GP15` |

## Wiring

```text
TSOP1838 S / OUT / DATA  → Pico GP15
TSOP1838 - / GND         → Pico GND
TSOP1838 + / VCC         → Pico 3V3(OUT)
```

## Recording Summary

| Metric | Count |
|---|---:|
| Total keys recorded | 44 |
| NEC protocol keys | 36 |
| Samsung protocol keys | 8 |
| Bits per key | 32 |

## Full IR Code Table

| # | Key Name | Protocol | Address | Command | Raw Data | Bits |
|---:|---|---|---|---|---|---:|
| 1 | Red Power Top | `NEC` | `0xFD01` | `0xDC` | `0x23DCFD01` | 32 |
| 2 | White Power | `Samsung` | `0x7` | `0x2` | `0xFD020707` | 32 |
| 3 | TV | `Samsung` | `0x7` | `0xF1` | `0xEF10707` | 32 |
| 4 | Mute Top Right | `NEC` | `0xFD01` | `0x9D` | `0x629DFD01` | 32 |
| 5 | TV/AV | `Samsung` | `0x7` | `0x1` | `0xFE010707` | 32 |
| 6 | Top VOL+ | `Samsung` | `0x7` | `0x7` | `0xF8070707` | 32 |
| 7 | Top VOL- | `Samsung` | `0x7` | `0xB` | `0xF40B0707` | 32 |
| 8 | Top CH+ | `Samsung` | `0x7` | `0x12` | `0xED120707` | 32 |
| 9 | Top CH- | `Samsung` | `0x7` | `0x10` | `0xEF100707` | 32 |
| 10 | SET | `NEC` | `0xFD01` | `0xDC` | `0x23DCFD01` | 32 |
| 11 | Mute Middle Right | `Samsung` | `0x7` | `0xF2` | `0xDF20707` | 32 |
| 12 | Red Record | `NEC` | `0xFD01` | `0xDD` | `0x22DDFD01` | 32 |
| 13 | Play/Pause | `NEC` | `0xFD01` | `0xD6` | `0x29D6FD01` | 32 |
| 14 | Stop | `NEC` | `0xFD01` | `0x91` | `0x6E91FD01` | 32 |
| 15 | Rewind | `NEC` | `0xFD01` | `0x8D` | `0x728DFD01` | 32 |
| 16 | INFO | `NEC` | `0xFD01` | `0xCF` | `0x30CFFD01` | 32 |
| 17 | Fast Forward | `NEC` | `0xFD01` | `0x95` | `0x6A95FD01` | 32 |
| 18 | Navigation CH+ / Up | `NEC` | `0xFD01` | `0xCA` | `0x35CAFD01` | 32 |
| 19 | Navigation CH- / Down | `NEC` | `0xFD01` | `0xD2` | `0x2DD2FD01` | 32 |
| 20 | Navigation VOL- / Left | `NEC` | `0xFD01` | `0x99` | `0x6699FD01` | 32 |
| 21 | Navigation VOL+ / Right | `NEC` | `0xFD01` | `0xC1` | `0x3EC1FD01` | 32 |
| 22 | OK | `NEC` | `0xFD01` | `0xCE` | `0x31CEFD01` | 32 |
| 23 | Left Side VOL+ | `NEC` | `0xFD01` | `0x80` | `0x7F80FD01` | 32 |
| 24 | Left Side VOL- | `NEC` | `0xFD01` | `0x81` | `0x7E81FD01` | 32 |
| 25 | Right Side CH+ | `NEC` | `0xFD01` | `0x85` | `0x7A85FD01` | 32 |
| 26 | Right Side CH- | `NEC` | `0xFD01` | `0x86` | `0x7986FD01` | 32 |
| 27 | MENU/EXIT | `NEC` | `0xFD01` | `0x98` | `0x6798FD01` | 32 |
| 28 | BACK | `NEC` | `0xFD01` | `0x82` | `0x7D82FD01` | 32 |
| 29 | Number 1 | `NEC` | `0xFD01` | `0x92` | `0x6D92FD01` | 32 |
| 30 | Number 2 | `NEC` | `0xFD01` | `0x93` | `0x6C93FD01` | 32 |
| 31 | Number 3 | `NEC` | `0xFD01` | `0xCC` | `0x33CCFD01` | 32 |
| 32 | Number 4 | `NEC` | `0xFD01` | `0x8E` | `0x718EFD01` | 32 |
| 33 | Number 5 | `NEC` | `0xFD01` | `0x8F` | `0x708FFD01` | 32 |
| 34 | Number 6 | `NEC` | `0xFD01` | `0xC8` | `0x37C8FD01` | 32 |
| 35 | Number 7 | `NEC` | `0xFD01` | `0x8A` | `0x758AFD01` | 32 |
| 36 | Number 8 | `NEC` | `0xFD01` | `0x8B` | `0x748BFD01` | 32 |
| 37 | Number 9 | `NEC` | `0xFD01` | `0xC4` | `0x3BC4FD01` | 32 |
| 38 | Number 0 | `NEC` | `0xFD01` | `0x87` | `0x7887FD01` | 32 |
| 39 | EPG | `NEC` | `0xFD01` | `0xDA` | `0x25DAFD01` | 32 |
| 40 | FAV | `NEC` | `0xFD01` | `0x9C` | `0x639CFD01` | 32 |
| 41 | Red AUDIO | `NEC` | `0xFD01` | `0x89` | `0x7689FD01` | 32 |
| 42 | Yellow MAIL | `NEC` | `0xFD01` | `0xD9` | `0x26D9FD01` | 32 |
| 43 | Green SUB | `NEC` | `0xFD01` | `0x84` | `0x7B84FD01` | 32 |
| 44 | Blue MEDIA | `NEC` | `0xFD01` | `0x96` | `0x6996FD01` | 32 |

## Notes

- Most set-top-box control keys use the `NEC` protocol with address `0xFD01`.
- The top TV-control section uses some `Samsung` protocol keys with address `0x7`.
- `Red Power Top` and `SET` recorded the same code: `NEC`, address `0xFD01`, command `0xDC`, raw `0x23DCFD01`.
- Some raw Samsung values have fewer visible hex digits, for example `0xEF10707`. That is normal formatting; it still represents a 32-bit code as recorded by the library.

## Copy-Friendly List

```text
Red Power Top = Protocol:NEC, Address:0xFD01, Command:0xDC, Raw:0x23DCFD01, Bits:32
White Power = Protocol:Samsung, Address:0x7, Command:0x2, Raw:0xFD020707, Bits:32
TV = Protocol:Samsung, Address:0x7, Command:0xF1, Raw:0xEF10707, Bits:32
Mute Top Right = Protocol:NEC, Address:0xFD01, Command:0x9D, Raw:0x629DFD01, Bits:32
TV/AV = Protocol:Samsung, Address:0x7, Command:0x1, Raw:0xFE010707, Bits:32
Top VOL+ = Protocol:Samsung, Address:0x7, Command:0x7, Raw:0xF8070707, Bits:32
Top VOL- = Protocol:Samsung, Address:0x7, Command:0xB, Raw:0xF40B0707, Bits:32
Top CH+ = Protocol:Samsung, Address:0x7, Command:0x12, Raw:0xED120707, Bits:32
Top CH- = Protocol:Samsung, Address:0x7, Command:0x10, Raw:0xEF100707, Bits:32
SET = Protocol:NEC, Address:0xFD01, Command:0xDC, Raw:0x23DCFD01, Bits:32
Mute Middle Right = Protocol:Samsung, Address:0x7, Command:0xF2, Raw:0xDF20707, Bits:32
Red Record = Protocol:NEC, Address:0xFD01, Command:0xDD, Raw:0x22DDFD01, Bits:32
Play/Pause = Protocol:NEC, Address:0xFD01, Command:0xD6, Raw:0x29D6FD01, Bits:32
Stop = Protocol:NEC, Address:0xFD01, Command:0x91, Raw:0x6E91FD01, Bits:32
Rewind = Protocol:NEC, Address:0xFD01, Command:0x8D, Raw:0x728DFD01, Bits:32
INFO = Protocol:NEC, Address:0xFD01, Command:0xCF, Raw:0x30CFFD01, Bits:32
Fast Forward = Protocol:NEC, Address:0xFD01, Command:0x95, Raw:0x6A95FD01, Bits:32
Navigation CH+ / Up = Protocol:NEC, Address:0xFD01, Command:0xCA, Raw:0x35CAFD01, Bits:32
Navigation CH- / Down = Protocol:NEC, Address:0xFD01, Command:0xD2, Raw:0x2DD2FD01, Bits:32
Navigation VOL- / Left = Protocol:NEC, Address:0xFD01, Command:0x99, Raw:0x6699FD01, Bits:32
Navigation VOL+ / Right = Protocol:NEC, Address:0xFD01, Command:0xC1, Raw:0x3EC1FD01, Bits:32
OK = Protocol:NEC, Address:0xFD01, Command:0xCE, Raw:0x31CEFD01, Bits:32
Left Side VOL+ = Protocol:NEC, Address:0xFD01, Command:0x80, Raw:0x7F80FD01, Bits:32
Left Side VOL- = Protocol:NEC, Address:0xFD01, Command:0x81, Raw:0x7E81FD01, Bits:32
Right Side CH+ = Protocol:NEC, Address:0xFD01, Command:0x85, Raw:0x7A85FD01, Bits:32
Right Side CH- = Protocol:NEC, Address:0xFD01, Command:0x86, Raw:0x7986FD01, Bits:32
MENU/EXIT = Protocol:NEC, Address:0xFD01, Command:0x98, Raw:0x6798FD01, Bits:32
BACK = Protocol:NEC, Address:0xFD01, Command:0x82, Raw:0x7D82FD01, Bits:32
Number 1 = Protocol:NEC, Address:0xFD01, Command:0x92, Raw:0x6D92FD01, Bits:32
Number 2 = Protocol:NEC, Address:0xFD01, Command:0x93, Raw:0x6C93FD01, Bits:32
Number 3 = Protocol:NEC, Address:0xFD01, Command:0xCC, Raw:0x33CCFD01, Bits:32
Number 4 = Protocol:NEC, Address:0xFD01, Command:0x8E, Raw:0x718EFD01, Bits:32
Number 5 = Protocol:NEC, Address:0xFD01, Command:0x8F, Raw:0x708FFD01, Bits:32
Number 6 = Protocol:NEC, Address:0xFD01, Command:0xC8, Raw:0x37C8FD01, Bits:32
Number 7 = Protocol:NEC, Address:0xFD01, Command:0x8A, Raw:0x758AFD01, Bits:32
Number 8 = Protocol:NEC, Address:0xFD01, Command:0x8B, Raw:0x748BFD01, Bits:32
Number 9 = Protocol:NEC, Address:0xFD01, Command:0xC4, Raw:0x3BC4FD01, Bits:32
Number 0 = Protocol:NEC, Address:0xFD01, Command:0x87, Raw:0x7887FD01, Bits:32
EPG = Protocol:NEC, Address:0xFD01, Command:0xDA, Raw:0x25DAFD01, Bits:32
FAV = Protocol:NEC, Address:0xFD01, Command:0x9C, Raw:0x639CFD01, Bits:32
Red AUDIO = Protocol:NEC, Address:0xFD01, Command:0x89, Raw:0x7689FD01, Bits:32
Yellow MAIL = Protocol:NEC, Address:0xFD01, Command:0xD9, Raw:0x26D9FD01, Bits:32
Green SUB = Protocol:NEC, Address:0xFD01, Command:0x84, Raw:0x7B84FD01, Bits:32
Blue MEDIA = Protocol:NEC, Address:0xFD01, Command:0x96, Raw:0x6996FD01, Bits:32
```

## Arduino/Pico Receiver Pin

```cpp
const int IR_RECEIVE_PIN = 15; // Pico GP15
```
