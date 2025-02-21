#define RED_PIN   A2
#define GREEN_PIN A1
#define BLUE_PIN  A0

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  fadeColor(RED_PIN, GREEN_PIN);  // Red to Green
  fadeColor(GREEN_PIN, BLUE_PIN); // Green to Blue
  fadeColor(BLUE_PIN, RED_PIN);   // Blue to Red
}

// Function to fade smoothly from one color to another
void fadeColor(int fromPin, int toPin) {
  for (int i = 0; i <= 255; i++) {
    analogWrite(fromPin, 255 - i); // Decrease current color
    analogWrite(toPin, i);         // Increase next color
    delay(1); // Adjust speed of transition
  }
}
