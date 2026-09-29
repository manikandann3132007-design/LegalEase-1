/**
 * Pure TypeScript OpenXML (.docx) and Plain Text (.txt) export utilities
 * Generates valid, native .docx files without external dependencies.
 */

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Standard CRC32 implementation for ZIP archive headers
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function createStoredZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    // Local file header (30 bytes + filename)
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // compression: 0 (STORE)
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x21, true); // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    local.set(nameBytes, 30);

    localHeaders.push(local, data);

    // Central directory header (46 bytes + filename)
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true); // flags
    cv.setUint16(10, 0, true); // compression: 0 (STORE)
    cv.setUint16(12, 0, true); // mod time
    cv.setUint16(14, 0x21, true); // mod date
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    centralHeaders.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centralHeaders.reduce((acc, arr) => acc + arr.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalSize = offset + centralSize + eocd.length;
  const output = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of localHeaders) {
    output.set(chunk, pos);
    pos += chunk.length;
  }
  for (const chunk of centralHeaders) {
    output.set(chunk, pos);
    pos += chunk.length;
  }
  output.set(eocd, pos);
  return output;
}

function buildWordDocumentXml(rawText: string): string {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const paragraphsXml: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphsXml.push(`<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`);
      return;
    }

    const cleanText = escapeXml(trimmed.replace(/^\*\*|\*\*$/g, ''));

    // Document Title (First non-empty line or all-caps title)
    if (index === 0 || (index < 3 && /^[A-Z\s\-&()]{8,}$/.test(trimmed))) {
      paragraphsXml.push(`
        <w:p>
          <w:pPr>
            <w:jc w:val="center"/>
            <w:spacing w:before="120" w:after="280"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
              <w:b/>
              <w:sz w:val="32"/>
            </w:rPr>
            <w:t>${cleanText}</w:t>
          </w:r>
        </w:p>
      `);
      return;
    }

    // Major Section Heading (e.g., "1. DEFINITIONS" or "1. Definitions")
    if (/^\d+\.\s+[A-Z]/.test(trimmed) && !/^\d+\.\d+/.test(trimmed)) {
      paragraphsXml.push(`
        <w:p>
          <w:pPr>
            <w:spacing w:before="280" w:after="140"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
              <w:b/>
              <w:sz w:val="24"/>
            </w:rPr>
            <w:t>${cleanText}</w:t>
          </w:r>
        </w:p>
      `);
      return;
    }

    // Standard Clause or Paragraph
    paragraphsXml.push(`
      <w:p>
        <w:pPr>
          <w:spacing w:after="140" w:line="300" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
            <w:sz w:val="22"/>
          </w:rPr>
          <w:t>${cleanText}</w:t>
        </w:r>
      </w:p>
    `);
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

export function slugifyFilename(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'legalease-agreement'
  );
}

export function downloadAsTxt(documentText: string, documentType: string): void {
  const filename = `${slugifyFilename(documentType)}-${new Date().toISOString().slice(0, 10)}.txt`;
  const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsDocx(documentText: string, documentType: string): void {
  const encoder = new TextEncoder();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = buildWordDocumentXml(documentText);

  const zipBytes = createStoredZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypesXml) },
    { name: '_rels/.rels', data: encoder.encode(relsXml) },
    { name: 'word/document.xml', data: encoder.encode(documentXml) },
  ]);

  const filename = `${slugifyFilename(documentType)}-${new Date().toISOString().slice(0, 10)}.docx`;
  const blob = new Blob([zipBytes.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
