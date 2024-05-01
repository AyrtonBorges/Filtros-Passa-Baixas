import Head from "next/head";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

/**
 * Aplica um filtro de média à imagem.
 * @param {ImageData} imageData Os dados da imagem a serem filtrados.
 * @param {number} width A largura da imagem.
 * @param {number} height A altura da imagem.
 * @param {number} kernelSize O tamanho do kernel do filtro.
 * @return {*}  {ImageData} Uma nova imagem com o filtro de média aplicado.
 */
function applyFilter(
  imageData1: ImageData,
  imageData2: ImageData,
  width: number,
  height: number,
  kernelSize: number,
  mode: number
): ImageData {
  const outputData = new Uint8ClampedArray(imageData1.data); // Cria um novo array de bytes para os dados da imagem filtrada, copiando os dados da imagem original

  //Loop pelos pixels verticais e horizontais da imagem, excluindo as bordas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4; // Calcula o índice do pixel atual no array de dados da imagem (cada pixel tem 4 componentes: RGBA) Matriz Linear e não bidmensional

      if (mode === 1) {
        outputData[pixelIndex] =
          imageData1.data[pixelIndex] & imageData2.data[pixelIndex]; // Componente vermelho
        outputData[pixelIndex + 1] =
          imageData1.data[pixelIndex + 1] & imageData2.data[pixelIndex + 1]; // Componente verde
        outputData[pixelIndex + 2] =
          imageData1.data[pixelIndex + 2] & imageData2.data[pixelIndex + 2]; // Componente azul
      } else if (mode === 2) {
        outputData[pixelIndex] =
          imageData1.data[pixelIndex] | imageData2.data[pixelIndex]; // Componente vermelho
        outputData[pixelIndex + 1] =
          imageData1.data[pixelIndex + 1] | imageData2.data[pixelIndex + 1]; // Componente verde
        outputData[pixelIndex + 2] =
          imageData1.data[pixelIndex + 2] | imageData2.data[pixelIndex + 2]; // Componente azul
      } else if (mode === 3) {
        outputData[pixelIndex] =
          imageData1.data[pixelIndex] ^ imageData2.data[pixelIndex]; // Componente vermelho
        outputData[pixelIndex + 1] =
          imageData1.data[pixelIndex + 1] ^ imageData2.data[pixelIndex + 1]; // Componente verde
        outputData[pixelIndex + 2] =
          imageData1.data[pixelIndex + 2] ^ imageData2.data[pixelIndex + 2]; // Componente azul
      } else {
        outputData[pixelIndex] = 255 - imageData1.data[pixelIndex]; // Componente vermelho
        outputData[pixelIndex + 1] = 255 - imageData1.data[pixelIndex + 1]; // Componente verde
        outputData[pixelIndex + 2] = 255 - imageData1.data[pixelIndex + 2]; // Componente azul
      }
    }
  }

  return new ImageData(outputData, width, height);
}

// Componente Home
export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImage2, setOriginalImage2] = useState<string | null>(null);
  const [originalSave, setOriginalSave] = useState<string | null>(null);
  const [originalSave2, setOriginalSave2] = useState<string | null>(null);
  const [filteredImage1, setFilteredImage1] = useState<string | null>(null);
  const [filteredImage2, setFilteredImage2] = useState<string | null>(null);
  const [filteredImage3, setFilteredImage3] = useState<string | null>(null);
  const [kernelSize, setKernelSize] = useState<number>(3);
  const [mode, setMode] = useState<number>(1);

  // Função para carregar a imagem e aplicar o filtro
  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setOriginalImage(e.target.result);
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // Redimensionar a imagem para um tamanho menor
              const maxWidth = 500;
              const maxHeight = 500;
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }

              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
              setOriginalSave(canvas.toDataURL("image/jpeg"));
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
              setOriginalImage(canvas.toDataURL("image/jpeg"));
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function handleImageUpload2(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          setOriginalImage2(e.target.result);
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // Redimensionar a imagem para um tamanho menor
              const maxWidth = 500;
              const maxHeight = 500;
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }

              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
              setOriginalSave2(canvas.toDataURL("image/jpeg"));
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
              setOriginalImage2(canvas.toDataURL("image/jpeg"));
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (mode === 1) {
      if (originalSave) {
        const img = new Image();
        img.src = originalSave;
        img.onload = () => {
          if (originalSave2) {
            const img2 = new Image();
            img2.src = originalSave2;
            img2.onload = () => {};
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const maxWidth = 500;
              const maxHeight = 500;
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
              const imageData1 = ctx.getImageData(0, 0, img.width, img.height);
              ctx.drawImage(img2, 0, 0, maxWidth, maxHeight);
              const imageData2 = ctx.getImageData(0, 0, img.width, img.height);
              const filteredMascaraZero1 = applyFilter(
                imageData1,
                imageData2,
                img.width,
                img.height,
                kernelSize,
                1
              );
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.putImageData(filteredMascaraZero1, 0, 0);
              let filteredImagePath = canvas.toDataURL("image/jpeg");
              let canvasFiltered = document.createElement("canvas");
              let ctxFiltered = canvasFiltered.getContext("2d");
              if (ctxFiltered) {
                canvasFiltered.width = img.width;
                canvasFiltered.height = img.height;
                ctxFiltered.putImageData(filteredMascaraZero1, 0, 0);
                const filteredImagePath =
                  canvasFiltered.toDataURL("image/jpeg");
                // Salvar o caminho da imagem filtrada
                setFilteredImage1(filteredImagePath);
              }
              ctx.drawImage(canvasFiltered, 0, 0, maxWidth, maxHeight);
              setFilteredImage1(canvas.toDataURL("image/jpeg"));

              const filteredMascaraZero2 = applyFilter(
                imageData1,
                imageData2,
                img.width,
                img.height,
                kernelSize,
                2
              );
              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.putImageData(filteredMascaraZero2, 0, 0);
              filteredImagePath = canvas.toDataURL("image/jpeg");
              canvasFiltered = document.createElement("canvas");
              ctxFiltered = canvasFiltered.getContext("2d");
              if (ctxFiltered) {
                canvasFiltered.width = img.width;
                canvasFiltered.height = img.height;
                ctxFiltered.putImageData(filteredMascaraZero2, 0, 0);
                const filteredImagePath =
                  canvasFiltered.toDataURL("image/jpeg");
                // Salvar o caminho da imagem filtrada
                setFilteredImage2(filteredImagePath);
              }
              ctx.drawImage(canvasFiltered, 0, 0, maxWidth, maxHeight);
              setFilteredImage2(canvas.toDataURL("image/jpeg"));
              const filteredMascaraZero3 = applyFilter(
                imageData1,
                imageData2,
                img.width,
                img.height,
                kernelSize,
                3
              );

              canvas.width = maxWidth;
              canvas.height = maxHeight;
              ctx.putImageData(filteredMascaraZero3, 0, 0);
              filteredImagePath = canvas.toDataURL("image/jpeg");
              canvasFiltered = document.createElement("canvas");
              ctxFiltered = canvasFiltered.getContext("2d");
              if (ctxFiltered) {
                canvasFiltered.width = img.width;
                canvasFiltered.height = img.height;
                ctxFiltered.putImageData(filteredMascaraZero3, 0, 0);
                const filteredImagePath =
                  canvasFiltered.toDataURL("image/jpeg");
                // Salvar o caminho da imagem filtrada
                setFilteredImage3(filteredImagePath);
              }
              ctx.drawImage(canvasFiltered, 0, 0, maxWidth, maxHeight);
              setFilteredImage3(canvas.toDataURL("image/jpeg"));
            }
          }
        };
      }
    } else if (mode === 2) {
        if (originalSave) {
            const img = new Image();
            img.src = originalSave;
            img.onload = () => {
              if (originalSave2) {
                const img2 = new Image();
                img2.src = originalSave2;
                img2.onload = () => {};
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  const maxWidth = 500;
                  const maxHeight = 500;
                  canvas.width = maxWidth;
                  canvas.height = maxHeight;
                  ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
                  const imageData1 = ctx.getImageData(0, 0, img.width, img.height);
                  ctx.drawImage(img2, 0, 0, maxWidth, maxHeight);
                  const imageData2 = ctx.getImageData(0, 0, img.width, img.height);
                  const filteredMascaraZero1 = applyFilter(
                    imageData1,
                    imageData1,
                    img.width,
                    img.height,
                    kernelSize,
                    4
                  );
                  canvas.width = maxWidth;
                  canvas.height = maxHeight;
                  ctx.putImageData(filteredMascaraZero1, 0, 0);
                  let filteredImagePath = canvas.toDataURL("image/jpeg");
                  let canvasFiltered = document.createElement("canvas");
                  let ctxFiltered = canvasFiltered.getContext("2d");
                  if (ctxFiltered) {
                    canvasFiltered.width = img.width;
                    canvasFiltered.height = img.height;
                    ctxFiltered.putImageData(filteredMascaraZero1, 0, 0);
                    const filteredImagePath =
                      canvasFiltered.toDataURL("image/jpeg");
                    // Salvar o caminho da imagem filtrada
                    setFilteredImage1(filteredImagePath);
                  }
                  ctx.drawImage(canvasFiltered, 0, 0, maxWidth, maxHeight);
                  setFilteredImage1(canvas.toDataURL("image/jpeg"));
    
                  const filteredMascaraZero2 = applyFilter(
                    imageData2,
                    imageData2,
                    img.width,
                    img.height,
                    kernelSize,
                    4
                  );
                  canvas.width = maxWidth;
                  canvas.height = maxHeight;
                  ctx.putImageData(filteredMascaraZero2, 0, 0);
                  filteredImagePath = canvas.toDataURL("image/jpeg");
                  canvasFiltered = document.createElement("canvas");
                  ctxFiltered = canvasFiltered.getContext("2d");
                  if (ctxFiltered) {
                    canvasFiltered.width = img.width;
                    canvasFiltered.height = img.height;
                    ctxFiltered.putImageData(filteredMascaraZero2, 0, 0);
                    const filteredImagePath =
                      canvasFiltered.toDataURL("image/jpeg");
                    // Salvar o caminho da imagem filtrada
                    setFilteredImage2(filteredImagePath);
                  }
                  ctx.drawImage(canvasFiltered, 0, 0, maxWidth, maxHeight);
                  setFilteredImage2(canvas.toDataURL("image/jpeg"));
                  setFilteredImage3(null);
                }
              }
            };
          }
    }
  }, [originalSave, originalSave2, kernelSize, mode]);

  function handleKernelSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const size = parseInt(event.target.value);
    if (!isNaN(size)) {
      setKernelSize(size);
    }
  }

  function handleModeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const mode = parseInt(event.target.value);
    if (!isNaN(mode)) {
      setMode(mode);
    }
  }

  return (
    <>
      <Head>
        <title>Operador Lógico</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Operador Lógico</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <input type="file" accept="image/*" onChange={handleImageUpload2} />
        <br></br>
        <select value={mode} onChange={handleModeChange}>
          <option value={1}>AND/OR/NOR</option>
          <option value={2}>NOT</option>
        </select>
        {/* <label>
          Tamanho do Kernel:
          <input
            step={2}
            type="number"
            value={kernelSize}
            min={1}
            onChange={handleKernelSizeChange}
          />
        </label> */}
        <div className={styles.imagens}>
          {originalImage && (
            <div>
              <h2>1ª Original</h2>
              <img src={originalImage} alt="Original" />
            </div>
          )}
          {originalImage2 && (
            <div>
              <h2>2ª Original</h2>
              <img src={originalImage2} alt="Original" />
            </div>
          )}
        </div>
        <div className={styles.imagens}>
          {filteredImage1 && (
            <div>
              <h2>{mode === 1 ? "AND" : "NOT 1ª Original"}</h2>
              <img src={filteredImage1} alt="Filtered" />
            </div>
          )}
          {filteredImage2 && (
            <div>
              <h2>{mode === 1 ? "OR" : "NOT 2ª Original"}</h2>
              <img src={filteredImage2} alt="Filtered" />
            </div>
          )}
        </div>
        <div className={styles.imagens}>
          {filteredImage3 && (
            <div>
              <h2>NOR</h2>
              <img src={filteredImage3} alt="Filtered" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
