export const minimalPcb = `
(kicad_pcb
  (version 20240101)
  (generator "geberai-test")
  (paper "A4")
  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
  )
  (net 0 "")
  (net 1 "GND")
  (net 2 "+3V3")
  (footprint "Package_QFN:QFN-32"
    (layer "F.Cu")
    (at 10 10 0)
    (property "Reference" "U1")
    (property "Value" "ESP32-S3")
    (pad "1" smd rect (at 0 0) (size 1 1) (layers "F.Cu") (net 2 "+3V3"))
    (pad "2" smd rect (at 1 0) (size 1 1) (layers "F.Cu") (net 1 "GND"))
  )
  (gr_line (start 0 0) (end 20 0) (layer "Edge.Cuts"))
  (gr_line (start 20 0) (end 20 20) (layer "Edge.Cuts"))
)
`;
