// Universal Vaccine & Medical Product Parser (Hosted on GitHub)
function parseVaccineLabelText(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let itemName = "";
  let manufacturerName = "";
  let batchNum = "";
  let expDate = "";

  // Comprehensive vaccine & medical supply keywords used in Maldives immunization programs
  const productKeywords = [
    "POLIOMYELITIS", "BOPV", "OPV", "IPV", "BCG", "DT", "DTP", "DTWPI", 
    "HEPATITIS B", "HEPB", "HEPA", "HPV", "GARDASIL", "INFLUENZA", "MENINGITIS", 
    "MMR", "MR", "ROTASIL", "ROTAVIRUS", "PCV", "PCV-10", "PCV-13", 
    "PENTA", "HIB", "TD", "TCV", "TYPHOID", "YELLOW FEVER", "SYRINGE", "DILUENT", 
    "VIAL ADAPTER", "DROPPER", "AD SYRINGE", "SAFETY BOX"
  ];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let upper = line.toUpperCase();

    // 1. Dynamic Item Name Detection
    for (let keyword of productKeywords) {
      if (upper.includes(keyword)) {
        if (!itemName) {
          itemName = line;
        } else if (!itemName.includes(line)) {
          itemName += " " + line;
        }
        break;
      }
    }

    // 2. Dynamic Manufacturer Detection
    if (upper.includes("SERUM INSTITUTE") || upper.includes("BIOLOGICAL") || 
        upper.includes("SANOFI") || upper.includes("MERCK") || 
        upper.includes("HINDUSTAN SYRINGES") || upper.includes("ABU DHABI MEDICAL") || 
        upper.includes("WUXI YUSHOU") || upper.includes("NCIPD") ||
        upper.includes("PVT. LTD") || upper.includes("L.L.C.")) {
      manufacturerName = line;
    }

    // 3. Dynamic Batch Number Detection (B.NO, BATCH, LOT, or GS1 (10))
    if (upper.includes("B.NO") || upper.includes("BATCH") || upper.includes("LOT")) {
      let parts = line.split(/[:\s]+/);
      if (parts.length > 1) batchNum = parts[parts.length - 1];
    } else if (line.includes("(10)")) {
      let parts = line.split(" ");
      batchNum = parts[parts.length - 1];
    }

    // 4. Dynamic Expiry Date Detection (GS1 Barcode (17) YYMMDD or EXP MM.YYYY / MM/YYYY)
    if (line.includes("(17)")) {
      let match = line.match(/\(17\)\s*(\d{6})/);
      if (match) {
        let yy = "20" + match[1].substring(0, 2);
        let mm = match[1].substring(2, 4);
        let dd = match[1].substring(4, 6);
        
        // GMT+5 Month-End Rollover Rule Check
        if (mm === "01" && (dd === "30" || dd === "31")) {
          expDate = `${yy}-${mm}-31`;
        } else {
          expDate = `${yy}-${mm}-${dd}`;
        }
      }
    } else if (upper.includes("EXP")) {
      let dateMatch = line.match(/(\d{2})[\.\-\/](\d{4})/);
      if (dateMatch) {
        let mm = dateMatch[1];
        let yy = dateMatch[2];
        if (mm === "01") expDate = `${yy}-${mm}-31`;
        else expDate = `${yy}-${mm}-01`;
      }
    }
  }

  if (!itemName && lines.length > 0) itemName = lines[0];

  return {
    item: itemName.trim(),
    manufacturer: manufacturerName.trim(),
    batchNumber: batchNum.trim(),
    expiryDate: expDate.trim()
  };
}
