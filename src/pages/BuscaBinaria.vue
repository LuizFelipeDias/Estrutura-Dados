<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const target = 9

const currentIndex = ref(null)
const visited = ref([])

const left = ref(0)
const right = ref(array.length - 1)
const done = ref(false)

const pauseTicks = ref(0)
const intervalId = ref(null)

function resetState() {
  currentIndex.value = null
  visited.value = []
  left.value = 0
  right.value = array.length - 1
  done.value = false
  pauseTicks.value = 0
}

function stepBinary() {
  if (!done.value) {
    if (left.value <= right.value) {
      const mid = Math.floor((left.value + right.value) / 2)
      currentIndex.value = mid

      if (!visited.value.includes(mid)) {
        visited.value = [...visited.value, mid]
      }

      const midVal = array[mid]
      if (midVal === target) {
        done.value = true
      } else if (midVal > target) {
        right.value = mid - 1
      } else {
        left.value = mid + 1
      }
    } else {
      done.value = true
    }
  } else {
    pauseTicks.value++
    if (pauseTicks.value >= 4) {
      resetState()
    }
  }
}

onMounted(() => {
  resetState()
  intervalId.value = setInterval(stepBinary, 900)
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
    return base + ' bg-yellow-400 text-red-700 shadow-md'
  }
  if (visited.value.includes(index)) {
    return base + ' bg-yellow-100 text-red-300'
  }
  return base + ' bg-yellow-500 text-red-700'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Busca Binária (visualização interativa)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Observe como a Busca Binária divide o array ordenado para encontrar o valor alvo.
      </p>

      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO (direita no desktop, em cima no mobile) -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            A <strong>Busca Binária</strong> é um algoritmo do tipo
            <strong>“dividir para conquistar”</strong>. Ela funciona apenas em arrays ordenados e,
            a cada comparação, descarta metade dos elementos que ainda poderiam conter o valor
            procurado.
          </p>

          <p>
            A lógica é simples: começamos pelo elemento do meio e o comparamos com o alvo. Se o
            valor do meio for maior que o alvo, descartamos todo o lado direito do array. Se for
            menor, descartamos o lado esquerdo. Em seguida, repetimos o processo na metade que
            sobrou, escolhendo um novo meio, até encontrar o valor ou esgotar as possibilidades.
          </p>

          <p>
            Essa estratégia faz com que o número de comparações cresça de forma
            <strong>logarítmica</strong> em relação ao tamanho do array. Por isso, a complexidade de
            tempo da Busca Binária é <strong>O(log n)</strong>, enquanto uma busca simples, passando
            elemento por elemento, teria custo <strong>O(n)</strong>.
          </p>

          <p>
            Na animação ao lado, o alvo é o número <strong>{{ target }}</strong>. Cada quadrado
            representa um elemento do array. Os elementos já verificados vão ficando mais claros,
            enquanto o elemento atualmente inspecionado fica em destaque com a seta logo abaixo.
          </p>

          <p class="text-slate-500 text-xs">
            Esta visualização foi inspirada em exemplos didáticos de busca binária presentes em
            sites como
            <a
                href="https://www.doabledanny.com/binary-search-javascript"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              Doable Danny
            </a>
            e animações semelhantes publicadas em
            <a
                href="https://www.codesdope.com"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              CodesDope
            </a>.
          </p>
        </div>

        <!-- ANIMAÇÃO (esquerda no desktop, embaixo no mobile) -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-6">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
                TARGET: {{ target }}
              </span>
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Binary Search
              </span>
            </div>

            <!-- Array -->
            <div class="flex justify-center">
              <div class="flex gap-1">
                <div
                    v-for="(n, index) in array"
                    :key="index"
                    :class="boxClass(index)"
                >
                  {{ n }}
                </div>
              </div>
            </div>

            <!-- Seta sob o elemento atual -->
            <div class="flex justify-center mt-2">
              <div class="flex gap-1 h-4 text-slate-700 text-lg">
                <span
                    v-for="(n, index) in array"
                    :key="'arrow-' + index"
                    class="flex items-start justify-center w-10 md:w-14"
                >
                  <span v-if="index === currentIndex">↑</span>
                </span>
              </div>
            </div>
          </div>

          <p class="text-center text-xs text-slate-400">
            O array é dividido ao meio a cada passo. Os elementos já verificados ficam esmaecidos;
            o elemento atual fica em destaque até que o alvo {{ target }} seja encontrado.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
