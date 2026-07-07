export const minimalSchematic = `
(kicad_sch
  (version 20240101)
  (generator "geberai-test")
  (paper "A4")
  (lib_symbols
    (symbol "MCU:ESP32-S3"
      (pin input line (at 0 0 0) (name "GPIO8") (number "1"))
      (pin power_in line (at 0 0 0) (name "VDD") (number "2"))
    )
  )
  (symbol
    (lib_id "MCU:ESP32-S3")
    (at 10 10 0)
    (property "Reference" "U1")
    (property "Value" "ESP32-S3")
    (property "Footprint" "Package_QFN:QFN-32")
    (in_bom yes)
    (on_board yes)
  )
  (global_label "SDA" (at 1 1 0))
  (wire (pts (xy 0 0) (xy 1 1)))
)
`;
