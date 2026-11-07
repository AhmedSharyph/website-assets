// Universal Vaccine & Medical Product Parser (Hosted on GitHub)
function parseVaccineLabelText(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let itemName = "";
  let manufacturerName = "";
  let batchNum = "";
  let expDate = "";

  const productKeywords = [
    "POLIOMYELITIS", "BOPV", "OPV", "IPV", "BCG", "DT", "DTP", "DTWPI", 
    "HEPATITIS B", "HEPB", "HPV", "GARDASIL", "INFLUENZA", "MENINGITIS", 
    "MMR", "MR", "ROTASIL", "ROTAVIRUS", "PCV", "PCV-10", "PCV-13", 
    "PENTA", "HIB", "TD", "TYPHOID", "YELLOW FEVER", "SYRINGE", "DILUENT", 
    "VIAL ADAPTER", "DROPPER"
  ];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let upper = line.toUpperCase();

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

    if (upper.includes("SERUM INSTITUTE") || upper.includes("BIOLOGICAL") || 
        upper.includes("SANOFI") || upper.includes("MERCK") || 
        upper.includes("HINDUSTAN SYRINGES") || upper.includes("ABU DHABI MEDICAL") || 
        upper.includes("WUXI YUSHOU") || upper.includes("PVT. LTD") || upper.includes("L.L.C.")) {
      manufacturerName = line;
    }

    if (upper.includes("B.NO") || upper.includes("BATCH") || upper.includes("LOT")) {
      let parts = line.split(/[:\s]+/);
      if (parts.length > 1) batchNum = parts[parts.length - 1];
    } else if (line.includes("(10)")) {
      let parts = line.split(" ");
      batchNum = parts[parts.length - 1];
    }

    if (line.includes("(17)")) {
      let match = line.match(/\(17\)\s*(\d{6})/);
      if (match) {
        let yy = "20" + match[1].substring(0, 2);
        let mm = match[1].substring(2, 4);
        let dd = match[1].substring(4, 6);
        
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
