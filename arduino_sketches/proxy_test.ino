#define IR_RECEIVE_PIN 27   // TSOP1838 receiver OUT/S/DATA -> Pico GP15
#define IR_SEND_PIN 16      // Pico GP16 -> 1k resistor -> BC548 base

#include <Arduino.h>
#include <IRremote.hpp>

const int LED_PIN = LED_BUILTIN;

void blinkLed(int times = 1) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(60);
    digitalWrite(LED_PIN, LOW);
    delay(60);
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);
  IrSender.begin(IR_SEND_PIN);

  Serial.println();
  Serial.println("=======================================");
  Serial.println("Raspberry Pi Pico IR Proxy Ready");
  Serial.println("=======================================");
  Serial.println("Receiver pin: GP15");
  Serial.println("Sender pin:   GP16");
  Serial.println();
  Serial.println("Point physical remote at receiver.");
  Serial.println("Point IR LED transmitter at TV/box.");
  Serial.println("Make sure remote does NOT directly hit TV/box.");
  Serial.println();
}

void loop() {
  if (IrReceiver.decode()) {
    // Ignore repeat frames for now so it does not spam the TV/box
    if (IrReceiver.decodedIRData.flags & IRDATA_FLAGS_IS_REPEAT) {
      IrReceiver.resume();
      return;
    }

    auto protocol = IrReceiver.decodedIRData.protocol;
    uint16_t address = IrReceiver.decodedIRData.address;
    uint16_t command = IrReceiver.decodedIRData.command;
    uint32_t rawData = IrReceiver.decodedIRData.decodedRawData;
    uint16_t bits = IrReceiver.decodedIRData.numberOfBits;

    Serial.println("=======================================");
    Serial.print("Received Protocol: ");
    Serial.println(getProtocolString(protocol));

    Serial.print("Address: 0x");
    Serial.println(address, HEX);

    Serial.print("Command: 0x");
    Serial.println(command, HEX);

    Serial.print("Raw Data: 0x");
    Serial.println(rawData, HEX);

    Serial.print("Bits: ");
    Serial.println(bits);

    blinkLed(1);

    // Stop receiving while sending to avoid the receiver picking up our own IR LED
    IrReceiver.stop();
    delay(30);

    if (protocol == NEC) {
      Serial.println("Sending as NEC...");
      IrSender.sendNEC(address, command, 0);
      Serial.println("Sent NEC.");
    }
    else if (protocol == SAMSUNG) {
      Serial.println("Sending as Samsung...");
      IrSender.sendSamsung(address, command, 0);
      Serial.println("Sent Samsung.");
    }
    else {
      Serial.println("Unsupported protocol for proxy send.");
      Serial.println("This sketch currently forwards NEC and Samsung only.");
    }

    delay(100);

    IrReceiver.start();
    IrReceiver.resume();

    Serial.println("Ready for next key...");
  }
}