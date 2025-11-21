<!-- HashEncadeada.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ----------------- Estado da animação ----------------- */
const bucketCount = 4

// cada bucket tem uma lista de nós { id, key, value }
const buckets = ref([])

const currentKey = ref(null)
const currentBucket = ref(null)
const statusMessage = ref('')
const opIndex = ref(0)
const pauseSteps = ref(0)
const intervalId = ref(null)
let nextNodeId = 1

// sequência fixa de inserções para mostrar colisões
const operations = [
  { key: 'K1', value: 'V1' },
  { key: 'K2', value: 'V2' },
  { key: 'K5', value: 'V5' },
  { key: 'K3', value: 'V3' },
  { key: 'K7', value: 'V7' },
  { key: 'K4', value: 'V4' },
]

// hash bem simples: usa o número da chave (K1 → 1) e faz módulo
function hashKey(key) {
  const num = Number(String(key).replace(/\D/g, '')) || 0
  return num % bucketCount
}

function initTable() {
  buckets.value = Array.from({ length: bucketCount }, () => ({
    nodes: [], // lista encadeada daquele bucket
  }))
  currentKey.value = null
  currentBucket.value = null
  statusMessage.value = ''
  opIndex.value = 0
  pauseSteps.value = 0
  nextNodeId = 1
}

function step() {
  // acabou a sequência → espera um pouco e reinicia
  if (opIndex.value >= operations.length) {
    pauseSteps.value++
    if (pauseSteps.value >= 4) {
      initTable()
    }
    return
  }

  const { key, value } = operations[opIndex.value]
  const j = hashKey(key)

  currentKey.value = key
  currentBucket.value = j

  const bucket = buckets.value[j]
  const before = bucket.nodes.length

  bucket.nodes.push({
    id: nextNodeId++,
    key,
    value,
  })

  const after = bucket.nodes.length

  if (before === 0) {
    statusMessage.value =
        `Inserindo (${key}, ${value}) no índice ${j}. ` +
        `O bucket estava vazio, então esse nó vira o head e o tail da lista encadeada.`
  } else {
    statusMessage.value =
        `Inserindo (${key}, ${value}) no índice ${j}. ` +
        `Já existiam ${before} elemento(s) ali, então encadeamos esse novo nó ao final da lista.`
  }

  opIndex.value++
}

onMounted(() => {
  initTable()
  intervalId.value = setInterval(step, 1400)
})

onBeforeUnmount(() => {
  if (intervalId.value) clearInterval(intervalId.value)
})

// classes auxiliares
function bucketHeaderClass(index) {
  const base =
      'flex-1 rounded-lg border p-2 text-center text-xs md:text-sm transition-colors duration-300'
  if (index === currentBucket.value) {
    return base + ' border-emerald-500 bg-emerald-50'
  }
  return base + ' border-slate-200 bg-slate-50'
}

function nodeClass(bucketIndex, node) {
  let base =
      'px-2 py-1 rounded border text-xs md:text-sm min-w-[72px] text-center flex flex-col bg-emerald-100 border-emerald-200'
  if (bucketIndex === currentBucket.value && node.key === currentKey.value) {
    base += ' ring-2 ring-emerald-500 font-bold'
  }
  return base
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Tabela Hash com Encadeamento (Separate Chaining)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Visualização de como uma tabela hash usa <strong>listas encadeadas</strong> em cada
        bucket para tratar colisões.
      </p>

      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO — em cima no mobile, à direita no desktop -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            Uma <strong>tabela hash</strong> armazena pares
            <strong>chave → valor</strong> e tenta fazer buscas em tempo
            <strong>O(1)</strong>, em média. Para isso, uma função de hash transforma a chave
            em um índice do array interno. Quando duas chaves diferentes caem no mesmo índice,
            temos uma <strong>colisão</strong>.:contentReference[oaicite:0]{index=0}
          </p>

          <p>
            No método de <strong>encadeamento separado</strong> (*separate chaining*), cada
            posição da tabela não guarda apenas um elemento, mas sim o
            <strong>início de uma lista encadeada</strong>. Todos os pares que colidem naquele
            índice são encadeados nessa lista. Assim, não precisamos procurar outro lugar na
            tabela: apenas inserimos o novo nó no bucket onde a colisão ocorreu.:contentReference[oaicite:1]{index=1}
          </p>

          <p>
            Na animação ao lado, a tabela tem {{ bucketCount }} buckets. Para inserir
            <code>(Kᵢ, Vᵢ)</code>:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li>calculamos um índice simples: <code>j = hash(Kᵢ) mod {{ bucketCount }}</code>;</li>
            <li>se o bucket <code>j</code> está vazio, o novo nó vira <em>head</em> e
              <em>tail</em> da lista;</li>
            <li>se já existe nó ali, ocorre uma colisão e encadeamos o novo nó ao final da
              lista daquele bucket.</li>
          </ul>

          <p>
            A busca por uma chave <code>K</code> segue o mesmo caminho: calculamos o índice,
            vamos ao bucket correspondente e percorremos a lista encadeada daquele bucket até
            encontrar a chave (ou chegar ao fim). Se a função de hash distribui bem as chaves e
            a tabela não fica muito cheia, o tamanho médio das listas é pequeno e as operações
            de inserção e busca continuam com custo médio próximo de <strong>O(1)</strong>.:contentReference[oaicite:2]{index=2}
          </p>

          <p class="text-slate-400 text-xs">
            Este texto foi livremente traduzido e adaptado a partir do artigo
            <a
                href="https://amiaynarayan.medium.com/hash-table-linked-list-implementation-5afcee05eafe"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              “Hash Table + Linked List Implementation”
            </a>,
            de Amiay Narayan (Medium).
          </p>

        </div>

        <!-- ANIMAÇÃO — embaixo no mobile, à esquerda no desktop -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-4">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3 text-xs text-slate-600">
              <div>
                <span class="font-semibold">Nível único:</span>
                <span class="ml-1">h(Kᵢ) = número da chave mod {{ bucketCount }}</span>
              </div>
              <div>
                Inserindo:
                <span class="font-semibold">{{ currentKey || '—' }}</span>
              </div>
            </div>

            <!-- linha com os buckets e a setinha de hash -->
            <div class="flex justify-between gap-2 mb-4">
              <div
                  v-for="(bucket, index) in buckets"
                  :key="'header-' + index"
                  :class="bucketHeaderClass(index)"
              >
                <div class="font-semibold">Bucket {{ index }}</div>
                <div class="flex flex-col items-center mt-1">
                  <i class="bi bi-arrow-down-short text-slate-400 text-lg"></i>
                  <span class="text-[10px] text-slate-400">lista encadeada</span>
                </div>
              </div>
            </div>

            <!-- listas encadeadas de cada bucket -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                  v-for="(bucket, bIndex) in buckets"
                  :key="'bucket-' + bIndex"
                  class="flex flex-col items-center gap-2"
              >
                <div class="text-[11px] text-slate-500">
                  Lista {{ bIndex }}
                </div>

                <div v-if="bucket.nodes.length" class="flex flex-col gap-1 items-center">
                  <div
                      v-for="node in bucket.nodes"
                      :key="node.id"
                      :class="nodeClass(bIndex, node)"
                  >
                    <span class="font-semibold">{{ node.key }}</span>
                    <span class="text-[11px] text-slate-600">→ {{ node.value }}</span>
                  </div>
                </div>

                <div v-else class="text-[11px] text-slate-400 italic">
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
