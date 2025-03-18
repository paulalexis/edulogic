#include <Wire.h>

#define RED_PIN   A2
#define GREEN_PIN A1
#define BLUE_PIN  A0
#define BUTTON_PIN A3
#define I2C_ADDRESS 0x08  // Unique I2C address for each Arduino

unsigned long previousMillis = 0;
const unsigned long buttonInterval = 300;
int colorIndex = 0;
bool buttonPressed = false;
unsigned long lastButtonPress = 0;

// Define colors (Red, Green, Blue)
const int colors[][3] = {
  {255, 0, 0},   // Red
  {0, 255, 0},   // Green
  {0, 0, 255},   // Blue
  {255, 0, 255}  // Magenta
};

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
  
  Wire.begin(I2C_ADDRESS);  // Initialize I2C as a slave
  Wire.onRequest(sendColorIndex);  // Register request handler
}

void loop() {
  unsigned long currentMillis = millis();

  // Check button press
  if (analogRead(BUTTON_PIN) < 500) {
    if (!buttonPressed && (currentMillis - lastButtonPress > buttonInterval)) {
      buttonPressed = true;
      lastButtonPress = currentMillis;
      colorIndex = (colorIndex + 1) % 4;
    }
  } else {
    buttonPressed = false;
  }

  // Set color
  setColor(colorIndex);
}

// Function to set LED color
void setColor(int color) {
  float k = 0.7;
  analogWrite(RED_PIN, int(k * colors[color][0]));
  analogWrite(GREEN_PIN, int(k * colors[color][1]));
  analogWrite(BLUE_PIN, int(k * colors[color][2]));
}

// Function to send the current color index to Raspberry Pi
void sendColorIndex() {
  Serial.println("Received!");
  Wire.write(colorIndex);
}
