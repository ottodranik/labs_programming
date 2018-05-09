function BmpReader(buffer, isAlpha) {
  this.pos = 0;
  this.buffer = buffer;
  this.isAlpha = !!isAlpha;
  this.bottomUp = true;
  this.flag = this.buffer.toString("utf-8", 0, this.pos += 2);
  if (this.flag !== "BM") throw new Error("Invalid BMP File");

  this.width = 0;
  this.height = 0;
  this.parseHeader();
  this.readBit24();
}

BmpReader.prototype.parseHeader = function() {
  this.fileSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.reserved = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.offset = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.headerSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.width = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.height = this.buffer.readInt32LE(this.pos);
  this.pos += 4;
  this.planes = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.bitPP = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.compress = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.rawSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.hr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.vr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.colors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.importantColors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;

  if(this.height < 0) {
    this.height *= -1;
    this.bottomUp = false;
  }

  if (this.bitPP !== 24) {
    throw new Error("Invalid BMP File");
  }

  this.data = new Buffer.allocUnsafe(this.width * this.height * 4);
}

BmpReader.prototype.readBit24 = function() {
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottomUp ? y : this.height - 1 - y;

    for (var x = 0; x < this.width; x++) {
      // Читать RGB из буффера
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var location = line * this.width * 4 + x * 4;
      this.data[location] = 0;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    // Пропустить экстра-байты
    this.pos += (this.width % 4);
  }
};

BmpReader.prototype.resize = function(scale) {
  const width = this.width * scale;
  const height = this.height * scale;
  const extraBytes = width % 4;
  const rgbSize = height * (3 * width + extraBytes);
  const headerInfoSize = 40;
  const fileSize = rgbSize + this.offset;
  const hr = 0;
  const vr = 0;

  const buffer = new Buffer.allocUnsafe(this.offset + rgbSize);
  let pos = 0;

  buffer.write(this.flag, pos, 2);
  pos += 2;
  buffer.writeUInt32LE(fileSize, pos);
  pos += 4;
  buffer.writeUInt32LE(this.reserved, pos);
  pos += 4;
  buffer.writeUInt32LE(this.offset, pos);
  pos += 4;
  buffer.writeUInt32LE(headerInfoSize, pos);
  pos += 4;
  buffer.writeUInt32LE(width, pos);
  pos += 4;
  buffer.writeInt32LE(-height, pos);
  pos += 4;
  buffer.writeUInt16LE(this.planes, pos);
  pos += 2;
  buffer.writeUInt16LE(this.bitPP, pos);
  pos += 2;
  buffer.writeUInt32LE(this.compress, pos);
  pos += 4;
  buffer.writeUInt32LE(rgbSize, pos); // rawSize after scale
  pos += 4;
  buffer.writeUInt32LE(this.hr, pos);
  pos += 4;
  buffer.writeUInt32LE(this.vr, pos);
  pos += 4;
  buffer.writeUInt32LE(this.colors, pos);
  pos += 4;
  buffer.writeUInt32LE(this.importantColors, pos);
  pos += 4;

  let i = 0;
  const rowBytes = 3 * width + extraBytes;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let p = pos + y * rowBytes + x * 3;
      i++ // alpha
      buffer[p] = this.data[i++]; // blue
      buffer[p+1] = this.data[i++]; // green
      buffer[p+2] = this.data[i++]; // red

      if (x !== 0 && x % scale !== 0) i -= 4;
    }
    if (y % scale !== 0) i -= this.width * 4; // Width of origin image exactly!

    // "якщо кількість пікселів у рядку помножена на 3 (розмір PIXELDATA) не ділиться на 4, 
    // необхідно дописувати ще кілька нульових байтів у кінець кожного рядка" (с)
    if(extraBytes > 0) {
      let fillOffset = pos + y * rowBytes + width * 3;
      buffer.fill(0, fillOffset, fillOffset + extraBytes);
    }
  }

  return buffer;
};

module.exports = function(bmpData) {
  var reader = new BmpReader(bmpData);
  return reader;
};
