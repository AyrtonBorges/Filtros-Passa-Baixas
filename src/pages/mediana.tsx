import Head from "next/head";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

function calculateMedian(values: number[]): number {
  const sortedValues = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  } else {
    return sortedValues[middle];
  }
}

// Função para aplicar o Filtro da Mediana
/**
 * Aplica um filtro de mediana à imagem.
 * @param imageData Os dados da imagem a serem filtrados.
 * @param width A largura da imagem.
 * @param height A altura da imagem.
 * @param kernelSize O tamanho do kernel do filtro.
 * @returns Uma nova imagem com o filtro de mediana aplicado.
 */
function applyMedianFilter(
  imageData: ImageData,
  width: number,
  height: number,
  kernelSize: number
): ImageData {
  const outputData = new Uint8ClampedArray(imageData.data); // Cria um novo array de bytes para os dados da imagem filtrada, copiando os dados da imagem original
  const halfKernelSize = Math.floor(kernelSize / 2);        // Calcula a metade do tamanho do kernel

  // Loop pelos pixels verticais e horizontais da imagem, excluindo as bordas
  for (let y = halfKernelSize; y < height - halfKernelSize; y++) {
    for (let x = halfKernelSize; x < width - halfKernelSize; x++) {
      const pixelIndex = (y * width + x) * 4; // Calcula o índice do pixel atual no array de dados da imagem (cada pixel tem 4 componentes: RGBA) Matriz Linear e não bidmensional

      // Inicializa arrays para armazenar os valores de cor dos vizinhos do pixel atual
      const redValues: number[] = [];
      const greenValues: number[] = [];
      const blueValues: number[] = [];

      // Loop pelos vizinhos do pixel atual, incluindo o próprio pixel
      for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
        for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
          const neighborPixelIndex = ((y + ky) * width + (x + kx)) * 4; // Calcula o índice do vizinho atual no array de dados da imagem

          // Armazena os valores de cor do vizinho atual nos arrays correspondentes
          redValues.push(imageData.data[neighborPixelIndex]);
          greenValues.push(imageData.data[neighborPixelIndex + 1]);
          blueValues.push(imageData.data[neighborPixelIndex + 2]);
        }
      }

      // Ordena os arrays de valores de cor
      redValues.sort((a, b) => a - b);
      greenValues.sort((a, b) => a - b);
      blueValues.sort((a, b) => a - b);

      // Calcula os valores medianos de cada componente de cor
      const medianRed = redValues[Math.floor(redValues.length * 0.5)];
      const medianGreen = greenValues[Math.floor(greenValues.length * 0.5)];
      const medianBlue = blueValues[Math.floor(blueValues.length * 0.5)];

      // Atribui os valores medianos de cor ao pixel atual
      outputData[pixelIndex] = medianRed;
      outputData[pixelIndex + 1] = medianGreen;
      outputData[pixelIndex + 2] = medianBlue;
    }
  }

  return new ImageData(outputData, width, height); // Retorna uma nova imagem com o filtro de mediana aplicado
}


// Componente Home

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSave, setOriginalSave] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [kernelSize, setKernelSize] = useState<number>(3);

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
              const filteredImageData = applyMedianFilter(
                imageData,
                img.width,
                img.height,
                3
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
          const filteredImageData = applyMedianFilter(
            imageData,
            img.width,
            img.height,
            kernelSize
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
  }, [originalSave, kernelSize]);

  function handleKernelSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const size = parseInt(event.target.value);
    if (!isNaN(size)) {
      setKernelSize(size);
    }
  }

  return (
    <>
      <Head>
        <title>Mediana</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Mediana</h1>

        <input type="file" accept="image/*" onChange={handleImageUpload} />
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
