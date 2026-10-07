/**
 * Product image ko fixed square canvas mein fit karta hai (bina crop ke).
 * Poori image "contain" hoke center mein aati hai, bachi jagah white fill.
 * Isse har product image same size/ratio ki hoti hai aur kuch katta nahi.
 *
 * fitImageToSquare(file, size = 1000) -> Promise<File> (JPEG)
 */
export function fitImageToSquare(file, size = 1000) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Please select an image file"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        // SVG ki natural size kabhi 0 aati hai - tab canvas size hi use karo
        const w = img.naturalWidth || size;
        const h = img.naturalHeight || size;
        const scale = Math.min(size / w, size / h);
        const dw = Math.round(w * scale);
        const dh = Math.round(h * scale);

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, Math.round((size - dw) / 2), Math.round((size - dh) / 2), dw, dh);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Could not process image"));
              return;
            }
            const base = (file.name || "image").replace(/\.[^.]+$/, "");
            resolve(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
