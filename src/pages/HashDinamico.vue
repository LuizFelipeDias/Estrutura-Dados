<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const bucketCount = 4
const keysToInsert = [12, 25, 36, 20, 30, 41, 51]

const buckets = ref([])
const currentKey = ref(null)
const highlightBucket = ref(null)
const statusMessage = ref('')
const opIndex = ref(0)
const pauseTicks = ref(0)
const intervalId = ref(null)

const PRIME = 101

function initTable() {
  buckets.value = []
  for (let j = 0; j < bucketCount; j++) {
    buckets.value.push({
      keys: [],
      slots: [],
      a: 1,
      b: 0,
      lastEvent: ''
    })
  }
  currentKey.value = null
  highlightBucket.value = null
  statusMessage.value = ''
  opIndex.value = 0
  pauseTicks.value = 0
}

function hTop(x) {
  return x % bucketCount
}

function hBucket(bucket, key) {
  if (!bucket.slots.length) return 0
  const idx = ((bucket.a * key + bucket.b) % PRIME) % bucket.slots.length
  return idx
}

function rebuildBucket(bucket, keys) {
  const m = keys.length
  const size = Math.max(1, m * m)
  let ok = false
  let a = 1
  let b = 0
  let slots = []

  while (!ok) {
    a = 1 + Math.floor(Math.random() * (PRIME - 1))
    b = Math.floor(Math.random() * PRIME)
    slots = new Array(size).fill(null)
    ok = true

    for (const key of keys) {
      const idx = ((a * key + b) % PRIME) % size
      if (slots[idx] !== null) {
        ok = false
        break
      }
      slots[idx] = key
    }
  }

  bucket.keys = [...keys]
  bucket.slots = slots
  bucket.a = a
  bucket.b = b
}

function stepInsert() {
  if (opIndex.value >= keysToInsert.length) {
    pauseTicks.value++
    if (pauseTicks.value >= 4) {
      initTable()
    }
    return
  }

  const key = keysToInsert[opIndex.value]
  currentKey.value = key

  const j = hTop(key)
  highlightBucket.value = j
  const bucket = buckets.value[j]

  if (bucket.keys.length === 0) {
    rebuildBucket(bucket, [key])
    bucket.lastEvent = 'novo'
    statusMessage.value =
        `Inserindo ${key} no bucket ${j}. Como é o primeiro elemento, ` +
        `criamos uma subtabela perfeita Tj só para ele.`
  } else {
    const idx = hBucket(bucket, key)

    if (bucket.slots[idx] === null) {
      bucket.slots[idx] = key
      bucket.keys.push(key)
      bucket.lastEvent = 'sem-colisao'
      statusMessage.value =
          `Inserindo ${key} no bucket ${j} usando a mesma função hj, sem colisão.`
    } else {
      const newKeys = [...bucket.keys, key]
      rebuildBucket(bucket, newKeys)
      bucket.lastEvent = 'colisao'
      statusMessage.value =
          `Colisão ao inserir ${key} no bucket ${j}. ` +
          `Recriamos a subtabela Tj com uma nova função hj que é perfeita ` +
          `para todas as chaves desse bucket.`
    }
  }

  opIndex.value++
}

onMounted(() => {
  initTable()
  intervalId.value = setInterval(stepInsert, 1400)
})

onBeforeUnmount(() => {
  if (intervalId.value) clearInterval(intervalId.value)
})

function bucketCardClass(index) {
  const base =
      'rounded-lg border p-3 flex flex-col gap-2 transition-colors duration-300'
  if (index === highlightBucket.value) {
    return base + ' border-emerald-500 bg-emerald-50'
  }
  return base + ' border-slate-200 bg-white'
}

function slotClass(bucketIndex, slotIndex) {
  const bucket = buckets.value[bucketIndex]
  const value = bucket.slots[slotIndex]
  const base =
      'flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm rounded border border-slate-200'
  if (value === null) return base + ' bg-slate-50 text-slate-300'
  if (bucketIndex === highlightBucket.value && value === currentKey.value) {
    return base + ' bg-emerald-400 text-white font-bold shadow'
  }
  return base + ' bg-emerald-100 text-slate-800 font-semibold'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Hash Dinâmico (Dynamic Perfect Hashing)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Veja como uma tabela hash em dois níveis usa funções hash aleatórias para manter
        <strong>buscas em O(1)</strong> mesmo no pior caso, reconstruindo apenas os buckets que colidem.
      </p>

      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            No <strong>hash dinâmico perfeito</strong>, usamos uma tabela em dois níveis. A função
            <strong>h</strong> de nível superior envia cada chave para um
            <strong>bucket</strong> <code>j</code>. Dentro de cada bucket existe uma
            <strong>subtabela T<sub>j</sub></strong> com a sua própria função
            <strong>h<sub>j</sub></strong>, escolhida ao acaso, que é
            <em>perfeita</em> para as chaves daquele bucket (sem colisões).
          </p>

          <p>
            A operação <strong>Locate(x)</strong> é direta: calculamos
            <code>j = h(x)</code>, vamos ao bucket <code>j</code> e depois usamos
            <code>h<sub>j</sub>(x)</code> para acessar a posição exata na subtabela
            <code>T<sub>j</sub></code>. Como cada <code>T<sub>j</sub></code> é construída
            sem colisões, a busca usa sempre tempo constante.
          </p>

          <p>
            Na <strong>inserção</strong>, mantemos um contador global de operações
            (<code>count</code>). Quando queremos inserir uma nova chave <code>x</code>:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li>Calculamos <code>j = h(x)</code> para descobrir o bucket.</li>
            <li>
              Se a posição <code>h<sub>j</sub>(x)</code> em <code>T<sub>j</sub></code> está vazia,
              apenas gravamos <code>x</code>.
            </li>
            <li>
              Se já houver outra chave ali, ocorre uma <strong>colisão</strong>: coletamos todas as
              chaves do bucket, escolhemos aleatoriamente uma nova função
              <code>h<sub>j</sub></code> e reconstruímos <code>T<sub>j</sub></code> até que
              <code>h<sub>j</sub></code> seja injetiva (sem colisões).
            </li>
          </ul>

          <p>
            Periodicamente, quando o número de inserções/remoções ultrapassa um limite
            <code>M</code>, é feito um <strong>FullRehash</strong>: removem-se os elementos
            marcados como excluídos, escolhe-se uma nova função <code>h</code> de topo, os buckets
            são redefinidos e todas as subtabelas perfeitas são reconstruídas. O tempo esperado
            dessa reconstrução é <strong>O(n)</strong>, de forma que o custo amortizado de cada
            operação permanece em <strong>O(1)</strong>.
          </p>

          <p class="text-slate-500 text-xs">
            Texto inspirado em materiais clássicos de <em>dynamic perfect hashing</em> e
            <em>universal hashing</em>, como notas de aula baseadas nos livros de M. Dietzfelbinger
            e nas entradas da Wikipedia sobre hash tables e dynamic perfect hashing.
          </p>
        </div>

        <!-- ANIMAÇÃO -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-4">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-xs text-slate-600">
                <span class="font-semibold">Nível 1:</span>
                <span class="ml-1">h(x) = x mod {{ bucketCount }}</span>
              </div>
              <div class="text-xs text-slate-500">
                Inserindo: <span class="font-semibold">{{ currentKey ?? '—' }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                  v-for="(bucket, index) in buckets"
                  :key="index"
                  :class="bucketCardClass(index)"
              >
                <!-- Cabeçalho do bucket: nome em cima, status embaixo -->
                <div class="flex flex-col text-xs mb-1">
                  <span class="font-semibold">
                    Bucket {{ index }}
                  </span>

                  <span
                      v-if="bucket.lastEvent === 'colisao'"
                      class="text-[10px] text-rose-600 font-semibold mt-0.5"
                  >
                      colisão / rehash
                  </span>

                  <span
                      v-else-if="bucket.lastEvent === 'novo'"
                      class="text-[10px] text-emerald-600 font-semibold mt-0.5"
                  >
                      novo
                  </span>
                </div>


                <div v-if="bucket.slots.length" class="flex flex-wrap gap-1">
                  <div
                      v-for="(value, sIndex) in bucket.slots"
                      :key="sIndex"
                      :class="slotClass(index, sIndex)"
                  >
                    {{ value === null ? '' : value }}
                  </div>
                </div>
                <div v-else class="text-[10px] text-slate-400 italic">
                  (vazio)
                </div>
              </div>
            </div>
          </div>

          <p class="text-center text-xs text-slate-500 min-h-[2.5rem]">
            {{ statusMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
