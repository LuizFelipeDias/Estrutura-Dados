<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Exemplo clássico de busca linear
const array = [10, 50, 30, 70, 80, 20, 90, 40]
const target = 30

const currentIndex = ref(null)  // posição atual do cursor
const visited = ref([])         // índices já visitados
const done = ref(false)         // já terminou a busca?

const pauseTicks = ref(0)       // tempo de pausa antes de reiniciar
const intervalId = ref(null)    // id do setInterval

function resetState() {
  currentIndex.value = null
  visited.value = []
  done.value = false
  pauseTicks.value = 0
}

function stepLinear() {
  if (!done.value) {
    // primeiro passo
    if (currentIndex.value === null) {
      currentIndex.value = 0
    } else {
      currentIndex.value++
    }

    // passou do fim do array -> encerra (não encontrou)
    if (currentIndex.value >= array.length) {
      done.value = true
      return
    }

    // marca como visitado
    if (!visited.value.includes(currentIndex.value)) {
      visited.value = [...visited.value, currentIndex.value]
    }

    const val = array[currentIndex.value]
    if (val === target) {
      // achou o alvo -> termina
      done.value = true
    }
  } else {
    // pequena pausa com o resultado na tela, depois reinicia a animação
    pauseTicks.value++
    if (pauseTicks.value >= 4) {
      resetState()
    }
  }
}

onMounted(() => {
  resetState()
  intervalId.value = setInterval(stepLinear, 900)
})

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

function boxClass(index) {
  const base =
      'flex items-center justify-center w-10 h-10 md:w-14 md:h-14 border border-white text-lg md:text-xl font-bold transition-colors duration-300'
  if (index === currentIndex.value) {
    // elemento atual destacado
    return base + ' bg-emerald-300 text-slate-800 shadow-md'
  }
  if (visited.value.includes(index)) {
    // já visitado (passado)
    return base + ' bg-emerald-50 text-slate-300'
  }
  // ainda não visitado
  return base + ' bg-white text-slate-800'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Busca Linear (visualização interativa)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Observe como a Busca Linear percorre o array elemento a elemento até encontrar o valor alvo.
      </p>

      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO: direita no desktop, em cima no mobile -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            Na <strong>Busca Linear</strong>, também chamada de <strong>busca sequencial</strong>,
            percorremos o array do início ao fim, comparando cada elemento com o valor alvo. Assim
            que encontramos uma ocorrência, retornamos o índice; se chegarmos ao final sem achar,
            retornamos <code>-1</code>.
          </p>

          <p>
            No exemplo desta página, o array é
            <code>[10, 50, 30, 70, 80, 20, 90, 40]</code> e o alvo é
            <strong>{{ target }}</strong>. Repare que o cursor começa na posição 0 e vai avançando
            uma casa por vez até alcançar o valor desejado.
          </p>

          <p>
            Do ponto de vista de desempenho, a Busca Linear tem:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li><strong>Melhor caso:</strong> O(1), quando o alvo está logo na primeira posição.</li>
            <li><strong>Pior caso:</strong> O(n), quando o alvo está na última posição ou não existe.</li>
            <li><strong>Caso médio:</strong> O(n), pois em média percorremos metade do array.</li>
          </ul>

          <p>
            A grande vantagem é a simplicidade: funciona em <strong>arrays não ordenados</strong>,
            não exige memória extra e é fácil de implementar. Por isso, é bastante usada quando:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li>os conjuntos de dados são pequenos;</li>
            <li>os elementos não estão ordenados;</li>
            <li>ou quando a clareza do código é mais importante do que a performance máxima.</li>
          </ul>

          <p class="text-slate-500 text-xs">
            A explicação teórica e os exemplos desta seção foram baseados e adaptados a partir do
            artigo sobre <em>Linear Search</em> publicado no
            <a
                href="https://www.geeksforgeeks.org/dsa/linear-search/"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              GeeksforGeeks
            </a>.
          </p>
        </div>

        <!-- ANIMAÇÃO: esquerda no desktop, embaixo no mobile -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-6">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
                KEY: {{ target }}
              </span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Linear Search Algorithm
              </span>
            </div>

            <!-- Array visual -->
            <div class="flex flex-col items-center gap-1">
              <!-- índices -->
              <div class="flex gap-1 text-[10px] text-slate-400 mb-1">
                <span
                    v-for="(n, index) in array"
                    :key="'idx-' + index"
                    class="flex items-center justify-center w-10 md:w-14"
                >
                  {{ index }}
                </span>
              </div>

              <!-- valores -->
              <div class="flex gap-1">
                <div
                    v-for="(n, index) in array"
                    :key="'val-' + index"
                    :class="boxClass(index)"
                >
                  {{ n }}
                </div>
              </div>

              <!-- seta sob o elemento atual -->
              <div class="flex gap-1 h-5 text-emerald-600 text-lg mt-1">
                <span
                    v-for="(n, index) in array"
                    :key="'arrow-' + index"
                    class="flex items-start justify-center w-10 md:w-14"
                >
                  <span v-if="index === currentIndex">⬆</span>
                </span>
              </div>
            </div>
          </div>

          <p class="text-center text-xs text-slate-400">
            O cursor percorre o array sequencialmente. Os elementos já comparados ficam esmaecidos;
            o elemento atual é destacado. Quando o valor {{ target }} é encontrado, a busca para e,
            após uma pequena pausa, a animação recomeça.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
