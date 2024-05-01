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
function applyAverageFilter(
  imageData: ImageData,
  width: number,
  height: number,
  kernelSize: number,
  mode: number
): ImageData {
  const outputData = new Uint8ClampedArray(imageData.data); // Cria um novo array de bytes para os dados da imagem filtrada, copiando os dados da imagem original
  const halfKernelSize = Math.floor(kernelSize / 2); // Calcula a metade do tamanho do kernel

  //Loop pelos pixels verticais e horizontais da imagem, excluindo as bordas
  for (let y = halfKernelSize; y < height - halfKernelSize; y++) {
    for (let x = halfKernelSize; x < width - halfKernelSize; x++) {
      const pixelIndex = (y * width + x) * 4; // Calcula o índice do pixel atual no array de dados da imagem (cada pixel tem 4 componentes: RGBA) Matriz Linear e não bidmensional

      //Inizializa a soma total dos componentes de cor dos pixels vizinhos
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;

      // Faz um loop pelos vizinhos do pixel atual, incluindo o próprio pixel
      for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
        for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
          const neighborPixelIndex = ((y + ky) * width + (x + kx)) * 4; // Calcula o índice do vizinho atual no array de dados da imagem

          // Soma os componentes de cor do vizinho atual
          if (mode === 1) {
            if (kx === 0 && ky === 0) {
              totalRed += imageData.data[neighborPixelIndex] * 8;
              totalGreen += imageData.data[neighborPixelIndex + 1] * 8;
              totalBlue += imageData.data[neighborPixelIndex + 2] * 8;
            } else {
              totalRed -= imageData.data[neighborPixelIndex];
              totalGreen -= imageData.data[neighborPixelIndex + 1];
              totalBlue -= imageData.data[neighborPixelIndex + 2];
            }
          } else if (mode === 2) {
            if (kx === 0 && ky === 0) {
              totalRed += imageData.data[neighborPixelIndex] * 4;
              totalGreen += imageData.data[neighborPixelIndex + 1] * 4;
              totalBlue += imageData.data[neighborPixelIndex + 2] * 4;
            } else if (
              (kx === 0 && ky === -1) ||
              (kx === -1 && ky === 0) ||
              (kx === 1 && ky === 1) ||
              (kx === 0 && ky === 1)
            ) {
              totalRed += imageData.data[neighborPixelIndex] * -1;
              totalGreen += imageData.data[neighborPixelIndex + 1] * -1;
              totalBlue += imageData.data[neighborPixelIndex + 2] * -1;
            }
          } else if (mode === 3) {
            if (kx === 0 && ky === 0) {
              totalRed += imageData.data[neighborPixelIndex] * 4;
              totalGreen += imageData.data[neighborPixelIndex + 1] * 4;
              totalBlue += imageData.data[neighborPixelIndex + 2] * 4;
            } else if (
              (kx === 0 && ky === -1) ||
              (kx === -1 && ky === 0) ||
              (kx === 1 && ky === 1) ||
              (kx === 0 && ky === 1)
            ) {
              totalRed += imageData.data[neighborPixelIndex] * -2;
              totalGreen += imageData.data[neighborPixelIndex + 1] * -2;
              totalBlue += imageData.data[neighborPixelIndex + 2] * -2;
            } else {
              totalRed += imageData.data[neighborPixelIndex];
              totalGreen += imageData.data[neighborPixelIndex + 1];
              totalBlue += imageData.data[neighborPixelIndex + 2];
            }
          }
        }
      }

      let Red;
      let Green;
      let Blue;
      if (mode === 1 || mode === 2 || mode === 3) {
        Red = totalRed;
        Green = totalGreen;
        Blue = totalBlue;
      }

      outputData[pixelIndex] = Red;
      outputData[pixelIndex + 1] = Green;
      outputData[pixelIndex + 2] = Blue;
    }
  }

  return new ImageData(outputData, width, height);
}

// Função para aplicar o Filtro de Roberts
function applyRobertsFilter(imageData, width, height) {
  const outputData = new Uint8ClampedArray(imageData.data);

  const robertsX = [
    [0, 0, -1],
    [0, 1, 0],
    [0, 0, 0]
  ];

  const robertsY = [
    [-1, 0, 0],
    [0, 1, 0],
    [0, 0, 0]
  ];

  function convolution(x, y, p, kernel) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const pixelIndex = ((y + j) * width + (x + i)) * 4;
        const value = imageData.data[pixelIndex + p];
        sum += value * kernel[j + 1][i + 1];
      }
    }
    return sum;
  }

  // Função para normalizar um valor entre 0 e 255
  function normalize(value) {
    return Math.max(0, Math.min(255, value));
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      let totalRed = convolution(x, y, 0, robertsX);
      let tempCalculo = convolution(x, y, 0, robertsY);
      totalRed = Math.sqrt(totalRed * totalRed + tempCalculo * tempCalculo);
      let totalGreen = convolution(x, y, 1, robertsX);
      tempCalculo = convolution(x, y, 1, robertsY);
      totalGreen = Math.sqrt(totalGreen * totalGreen + tempCalculo * tempCalculo);
      let totalBlue = convolution(x, y, 2, robertsX);
      tempCalculo = convolution(x, y, 2, robertsY);
      totalBlue = Math.sqrt(totalBlue * totalBlue + tempCalculo * tempCalculo);

      
      // Normaliza o gradiente para o intervalo entre 0 e 255
      const tempRed = normalize(totalRed);
      const tempGreen = normalize(totalGreen);
      const tempBlue = normalize(totalBlue);
      
      outputData[pixelIndex] = tempRed;
      outputData[pixelIndex + 1] = tempGreen;
      outputData[pixelIndex + 2] = tempBlue;
    }
  }

  return new ImageData(outputData, width, height);
}


// Função para aplicar o Filtro de Sobel
function applySobelFilter(imageData, width, height) {
  const outputData = new Uint8ClampedArray(imageData.data);

  const sobelX = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1]
  ];

  const sobelY = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1]
  ];

  function convolution(x, y, p, kernel) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const pixelIndex = ((y + j) * width + (x + i)) * 4;
        const value = imageData.data[pixelIndex + p];
        sum += value * kernel[j + 1][i + 1];
      }
    }
    return sum;
  }

  // Função para normalizar um valor entre 0 e 255
  function normalize(value) {
    return Math.max(0, Math.min(255, value));
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      let totalRed = convolution(x, y, 0, sobelX);
      let tempCalculo = convolution(x, y, 0, sobelY);
      totalRed = Math.sqrt(totalRed * totalRed + tempCalculo * tempCalculo);
      let totalGreen = convolution(x, y, 1, sobelX);
      tempCalculo = convolution(x, y, 1, sobelY);
      totalGreen = Math.sqrt(totalGreen * totalGreen + tempCalculo * tempCalculo);
      let totalBlue = convolution(x, y, 2, sobelX);
      tempCalculo = convolution(x, y, 2, sobelY);
      totalBlue = Math.sqrt(totalBlue * totalBlue + tempCalculo * tempCalculo);

      
      // Normaliza o gradiente para o intervalo entre 0 e 255
      const tempRed = normalize(totalRed);
      const tempGreen = normalize(totalGreen);
      const tempBlue = normalize(totalBlue);
      
      outputData[pixelIndex] = tempRed;
      outputData[pixelIndex + 1] = tempGreen;
      outputData[pixelIndex + 2] = tempBlue;
    }
  }

  return new ImageData(outputData, width, height);
}


// Componente Home
export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSave, setOriginalSave] = useState<string | null>(null);
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

              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0, img.width, img.height);
              setOriginalSave(canvas.toDataURL("image/jpeg"));
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              setOriginalImage(canvas.toDataURL("image/jpeg"));
            }
          };
        }
      };
      reader.readAsDataURL(file);
    }
  }

  useEffect(() => {
    if (originalSave) {
      const img = new Image();
      img.src = originalSave;
      img.onload = () => {
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
          if (mode === 1) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const filteredMascaraZero1 = applyAverageFilter(
              imageData,
              img.width,
              img.height,
              kernelSize,
              1
            );
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(filteredMascaraZero1, 0, 0);
            let filteredImagePath = canvas.toDataURL("image/jpeg");
            let canvasFiltered = document.createElement("canvas");
            let ctxFiltered = canvasFiltered.getContext("2d");
            if (ctxFiltered) {
              canvasFiltered.width = img.width;
              canvasFiltered.height = img.height;
              ctxFiltered.putImageData(filteredMascaraZero1, 0, 0);
              const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
              // Salvar o caminho da imagem filtrada
              setFilteredImage1(filteredImagePath);
            }
            ctx.drawImage(canvasFiltered, 0, 0, width, height);
            setFilteredImage1(canvas.toDataURL("image/jpeg"));

            const filteredMascaraZero2 = applyAverageFilter(
              imageData,
              img.width,
              img.height,
              kernelSize,
              2
            );
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(filteredMascaraZero2, 0, 0);
            filteredImagePath = canvas.toDataURL("image/jpeg");
            canvasFiltered = document.createElement("canvas");
            ctxFiltered = canvasFiltered.getContext("2d");
            if (ctxFiltered) {
              canvasFiltered.width = img.width;
              canvasFiltered.height = img.height;
              ctxFiltered.putImageData(filteredMascaraZero2, 0, 0);
              const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
              // Salvar o caminho da imagem filtrada
              setFilteredImage2(filteredImagePath);
            }
            ctx.drawImage(canvasFiltered, 0, 0, width, height);
            setFilteredImage2(canvas.toDataURL("image/jpeg"));
            const filteredMascaraZero3 = applyAverageFilter(
              imageData,
              img.width,
              img.height,
              kernelSize,
              3
            );

            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(filteredMascaraZero3, 0, 0);
            filteredImagePath = canvas.toDataURL("image/jpeg");
            canvasFiltered = document.createElement("canvas");
            ctxFiltered = canvasFiltered.getContext("2d");
            if (ctxFiltered) {
              canvasFiltered.width = img.width;
              canvasFiltered.height = img.height;
              ctxFiltered.putImageData(filteredMascaraZero3, 0, 0);
              const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
              // Salvar o caminho da imagem filtrada
              setFilteredImage3(filteredImagePath);
            }
            ctx.drawImage(canvasFiltered, 0, 0, width, height);
            setFilteredImage3(canvas.toDataURL("image/jpeg"));
          } else if (mode === 2) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const filteredMascaraZero1 = applyRobertsFilter(
              imageData,
              img.width,
              img.height,
            );
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(filteredMascaraZero1, 0, 0);
            let filteredImagePath = canvas.toDataURL("image/jpeg");
            let canvasFiltered = document.createElement("canvas");
            let ctxFiltered = canvasFiltered.getContext("2d");
            if (ctxFiltered) {
              canvasFiltered.width = img.width;
              canvasFiltered.height = img.height;
              ctxFiltered.putImageData(filteredMascaraZero1, 0, 0);
              const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
              // Salvar o caminho da imagem filtrada
              setFilteredImage1(filteredImagePath);
            }
            ctx.drawImage(canvasFiltered, 0, 0, width, height);
            setFilteredImage1(canvas.toDataURL("image/jpeg"));

            const filteredMascaraZero2 = applySobelFilter(
              imageData,
              img.width,
              img.height
            );
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(filteredMascaraZero2, 0, 0);
            filteredImagePath = canvas.toDataURL("image/jpeg");
            canvasFiltered = document.createElement("canvas");
            ctxFiltered = canvasFiltered.getContext("2d");
            if (ctxFiltered) {
              canvasFiltered.width = img.width;
              canvasFiltered.height = img.height;
              ctxFiltered.putImageData(filteredMascaraZero2, 0, 0);
              const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
              // Salvar o caminho da imagem filtrada
              setFilteredImage2(filteredImagePath);
            }
            ctx.drawImage(canvasFiltered, 0, 0, width, height);
            setFilteredImage2(canvas.toDataURL("image/jpeg"));
            setFilteredImage3(null);
          }
        }
      };
    }
  }, [originalSave, kernelSize, mode]);

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
        <title>Passa-alta</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Filtro Passa-alta</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <br></br>
        <select value={mode} onChange={handleModeChange}>
          <option value={1}>Linear</option>
          <option value={2}>Não Linear</option>
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
              <h2>Original</h2>
              <img src={originalImage} alt="Original" />
            </div>
          )}
          {filteredImage1 && (
            <div>
              <h2>{mode === 1 ? "Primeiro" : "Roberts"}</h2>
              <img src={filteredImage1} alt="Filtered" />
            </div>
          )}
        </div>
        <div className={styles.imagens}>
          {filteredImage2 && (
            <div>
              <h2>{mode === 1 ? "Segundo" : "Sobel"}</h2>
              <img src={filteredImage2} alt="Filtered" />
            </div>
          )}
          {filteredImage3 && (
            <div>
              <h2>Terceiro</h2>
              <img src={filteredImage3} alt="Filtered" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
