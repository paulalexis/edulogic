template <typename T, uint8_t N> struct array
{
    T _data[N]; // il suffisait d'encapsuler le tableau !

  public:
    constexpr static uint8_t size() { return N; }
    T const &operator[](uint8_t idx) const { return _data[idx]; }
    T &operator[](uint8_t idx) { return _data[idx]; }
    T *data() { return _data; }
    const T *data() const { return _data; }
    T *begin() { return _data; }
    const T *begin() const { return _data; }
    T *end() { return _data + N; }
    const T *end() const { return _data + N; }
};

template<typename T> struct span {
    T* _begin;
    T* _end;

  public:
    span(T* begin, T* end) : _begin{begin}, _end{end}{}
    template<typename E> span(E& container) :
        _begin{container.begin()},_end{container.end()}{}

    uint8_t size() const { return _end - _begin; }
    T const &operator[](uint8_t idx) const { return _begin[idx]; }
    T &operator[](uint8_t idx) { return _begin[idx]; }
    T *data() { return _begin; }
    const T *data() const { return _begin; }
    T *begin() { return _begin; }
    const T *begin() const { return _begin; }
    T *end() { return _end; }
    const T *end() const { return _end; }
};

array<bool, 4> led_states = {false, false, false, true};
long  time_register = 0;

void setup() {
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);

  time_register = millis();
  Serial.begin(9600);
}

void turn_on(array<bool, 4> led_states){
  if (int(millis())%2 == 0){
    digitalWrite(6, 1);
    digitalWrite(7, 0);

    digitalWrite(2, !led_states[0]);
    digitalWrite(3, !led_states[1]);
  } else {
    digitalWrite(6, 0);
    digitalWrite(7, 1);

    digitalWrite(4, !led_states[2]);
    digitalWrite(5, !led_states[3]);
  }
}

void loop() {
  if (millis() > time_register + 1000){
    const bool last = led_states[3];
    for (auto i = led_states.size() - 1; i > 0 ; i--){
      led_states[i] = led_states[i-1];
    }
    led_states[0] = last;
    time_register = millis();
    
    Serial.println();
  }
  turn_on(led_states);
}
