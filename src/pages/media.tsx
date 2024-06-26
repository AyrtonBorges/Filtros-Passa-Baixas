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
          if (mode === 9) {
            totalRed += imageData.data[neighborPixelIndex];
            totalGreen += imageData.data[neighborPixelIndex + 1];
            totalBlue += imageData.data[neighborPixelIndex + 2];
          } else if (mode === 5) {
            if (
              (kx === 1 && ky === 0) ||
              (kx === 0 && ky === 0) ||
              (kx === -1 && ky === 1) ||
              (kx === 1 && ky === 1)
            ) {
            } else {
              totalRed += imageData.data[neighborPixelIndex];
              totalGreen += imageData.data[neighborPixelIndex + 1];
              totalBlue += imageData.data[neighborPixelIndex + 2];
            }
          } else if (mode === 10) {
            if (kx === 0 && ky === 0) {
              totalRed += imageData.data[neighborPixelIndex] * 2;
              totalGreen += imageData.data[neighborPixelIndex + 1] * 2;
              totalBlue += imageData.data[neighborPixelIndex + 2] * 2;
            }
          }
        }
      }

      // Calcula a média dos componentes de cor dos pixels vizinhos
      let averageRed;
      let averageGreen;
      let averageBlue;
      if (mode === 9) {
        averageRed = Math.round(totalRed / (kernelSize * kernelSize));
        averageGreen = Math.round(totalGreen / (kernelSize * kernelSize));
        averageBlue = Math.round(totalBlue / (kernelSize * kernelSize));
      } else {
        averageRed = Math.round(totalRed / mode);
        averageGreen = Math.round(totalGreen / mode);
        averageBlue = Math.round(totalBlue / mode);
      }
      // Atribui a média dos componentes de cor ao pixel atual
      outputData[pixelIndex] = averageRed;
      outputData[pixelIndex + 1] = averageGreen;
      outputData[pixelIndex + 2] = averageBlue;
    }
  }

  return new ImageData(outputData, width, height);
}

// Componente Home
export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSave, setOriginalSave] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [kernelSize, setKernelSize] = useState<number>(3);
  const [mode, setMode] = useState<number>(9);

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
              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              console.log(img.width, img.height);
              const filteredImageData = applyAverageFilter(
                imageData,
                img.width,
                img.height,
                3,
                mode
              ); // Altere o tamanho do kernel conforme necessário
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              setOriginalImage(canvas.toDataURL("image/jpeg"));
              const canvasFiltered = document.createElement("canvas");
              const ctxFiltered = canvasFiltered.getContext("2d");
              if (ctxFiltered) {
                canvasFiltered.width = img.width;
                canvasFiltered.height = img.height;
                ctxFiltered.putImageData(filteredImageData, 0, 0);
                const filteredImagePath =
                  canvasFiltered.toDataURL("image/jpeg");
                // Salvar o caminho da imagem filtrada
                setFilteredImage(filteredImagePath);
              }
              ctx.drawImage(canvasFiltered, 0, 0, width, height);
              setFilteredImage(canvas.toDataURL("image/jpeg"));
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

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const filteredImageData = applyAverageFilter(
            imageData,
            img.width,
            img.height,
            kernelSize,
            mode
          );
          canvas.width = width;
          canvas.height = height;
          ctx.putImageData(filteredImageData, 0, 0);
          const filteredImagePath = canvas.toDataURL("image/jpeg");
          const canvasFiltered = document.createElement("canvas");
          const ctxFiltered = canvasFiltered.getContext("2d");
          if (ctxFiltered) {
            canvasFiltered.width = img.width;
            canvasFiltered.height = img.height;
            ctxFiltered.putImageData(filteredImageData, 0, 0);
            const filteredImagePath = canvasFiltered.toDataURL("image/jpeg");
            // Salvar o caminho da imagem filtrada
            setFilteredImage(filteredImagePath);
          }
          ctx.drawImage(canvasFiltered, 0, 0, width, height);
          setFilteredImage(canvas.toDataURL("image/jpeg"));
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
        <title>Média</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Filtro lineare passa-baixa Média</h1>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <select value={mode} onChange={handleModeChange}>
          <option value={9}>9</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
        <label>
          Tamanho do Kernel:
          <input
            step={2}
            type="number"
            value={kernelSize}
            min={1}
            onChange={handleKernelSizeChange}
          />
        </label>
        <div className={styles.imagens}>
          {originalImage && (
            <div>
              <h2>Original</h2>
              <img src={originalImage} alt="Original" />
            </div>
          )}
          {filteredImage && (
            <div>
              <h2>Filtrada</h2>
              <img src={filteredImage} alt="Filtered" />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
