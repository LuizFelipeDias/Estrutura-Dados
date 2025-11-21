<!-- SkipList.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ----------------- Construção estática da Skip List ----------------- */
/*
   Vamos usar chaves ordenadas e alturas fixas, para a animação
   ser sempre a mesma (sem aleatoriedade).
   keys:     [ 3, 7, 9, 12, 17, 21, 25 ]
   alturas:  quantos níveis cada chave ocupa (de baixo para cima)
*/
const keys = [3, 7, 9, 12, 17, 21, 25]
const heightsMap = {
  3: 2,
  7: 1,
  9: 2,
  12: 3,
  17: 1,
  21: 2,
  25: 3,
}

const targetKey = 17

// níveis da visualização: array de linhas, da mais alta para a mais baixa
// cada nó: { id, key }
const levels = ref([])

// animação da busca
const activeNodeId = ref(null)
const foundNodeId = ref(null)
const statusMessage = ref('')
const stepIndex = ref(0)
const steps = ref([])
const intervalId = ref(null)

let nextId = 1

function buildSkipList() {
  nextId = 1
  const maxHeight = Math.max(...Object.values(heightsMap))
  const tempLevels = []

  // levelIdx: de cima (maxHeight-1) para baixo (0)
  for (let level = maxHeight - 1; level >= 0; level--) {
    const row = []
    for (const k of keys) {
      if (heightsMap[k] > level) {
        row.push({ id: nextId++, key: k })
      }
    }
    tempLevels.push(row)
  }

  levels.value = tempLevels
}

/* ----------------- Cálculo do caminho da busca ----------------- */
function computeSearchSteps(target) {
  const rows = levels.value
  const path = []

  if (!rows.length || !rows[0].length) return path

  let row = 0 // 0 = nível mais alto
  let col = 0 // começa no primeiro nó do nível mais alto

  while (row < rows.length) {
    const node = rows[row][col]
    if (!node) break

    // visitamos o nó atual
    path.push({
      nodeId: node.id,
      action: 'visit',
      note: `Comparando ${node.key} com o alvo ${target}.`,
    })

    if (node.key === target) {
      path.push({
        nodeId: node.id,
        action: 'found',
        note: `Encontramos ${target} neste nível. A busca termina aqui.`,
      })
      break
    }

    const nextRight = rows[row][col + 1]

    if (nextRight && nextRight.key <= target) {
      // podemos "pular" para a direita
      col += 1
      path.push({
        nodeId: rows[row][col].id,
        action: 'move-right',
        note: `Andamos para a direita, pois ${nextRight.key} ainda é ≤ ${target}.`,
      })
    } else {
      // não dá para ir mais à direita sem ultrapassar o alvo → descemos
      if (row + 1 < rows.length) {
        const belowRow = rows[row + 1]
        const belowIndex = belowRow.findIndex((n) => n.key === node.key)

        row += 1
        col = belowIndex !== -1 ? belowIndex : 0

        const belowNode = rows[row][col]
        path.push({
          nodeId: belowNode.id,
          action: 'move-down',
          note: `Descemos um nível mantendo a chave ${node.key} como referência.`,
        })
      } else {
        // já estamos na base e não encontramos o valor
        path.push({
          nodeId: node.id,
          action: 'not-found',
          note: `Chegamos ao fim da lista base sem encontrar ${target}.`,
        })
        break
      }
    }
  }

  return path
}

/* ----------------- Controle da animação ----------------- */
function applyStep(step) {
  if (!step) return
  activeNodeId.value = step.nodeId || null
  if (step.action === 'found') {
    foundNodeId.value = step.nodeId
  }
  statusMessage.value = step.note
}

function startAnimation() {
  buildSkipList()
  steps.value = computeSearchSteps(targetKey)
  stepIndex.value = 0
  activeNodeId.value = null
  foundNodeId.value = null
  statusMessage.value = 'Iniciando a busca pela chave ' + targetKey + ' na skip list.'

  if (intervalId.value) clearInterval(intervalId.value)
  intervalId.value = setInterval(() => {
    if (stepIndex.value >= steps.value.length) {
      clearInterval(intervalId.value)
      intervalId.value = null
      return
    }
    const step = steps.value[stepIndex.value]
    applyStep(step)
    stepIndex.value++
  }, 1400)
}

onMounted(() => {
  startAnimation()
})

onBeforeUnmount(() => {
  if (intervalId.value) clearInterval(intervalId.value)
})

/* ----------------- Classes auxiliares ----------------- */
function nodeClass(node) {
  const base =
      'px-3 py-2 rounded border min-w-[52px] text-center text-xs md:text-sm transition-colors duration-300'

  if (node.id === foundNodeId.value) {
    return base + ' bg-emerald-600 text-white border-emerald-700 font-bold'
  }

  if (node.id === activeNodeId.value) {
    return base + ' bg-emerald-400 text-white border-emerald-500 font-semibold'
  }

  return base + ' bg-emerald-100 text-slate-800 border-emerald-200'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Skip List (lista com pulos) em JavaScript
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Animação da <strong>busca</strong> na skip list para o valor
        <strong>{{ targetKey }}</strong>, com explicação conceitual ao lado.
      </p>

      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO – em cima no mobile, à direita no desktop -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            Uma <strong>skip list</strong> é uma estrutura dinâmica que permite
            <strong>busca rápida</strong> em uma sequência ordenada de elementos. Em vez de
            usar apenas uma lista encadeada simples, ela mantém
            <strong>vários níveis de listas</strong>: a base contém todos os elementos e os
            níveis superiores contêm apenas alguns deles, funcionando como “atalhos” que
            aceleram a navegação. :contentReference[oaicite:0]{index=0}
          </p>

          <p>
            Cada nó guarda uma <strong>chave</strong>, um <strong>valor</strong> e dois
            ponteiros: <code>right</code> (para o próximo nó no mesmo nível) e
            <code>down</code> (para o nó correspondente no nível abaixo). Assim, um mesmo
            elemento pode aparecer em vários níveis empilhados verticalmente, formando
            colunas de nós com a mesma chave. :contentReference[oaicite:1]{index=1}
          </p>

          <p>
            Na <strong>inserção</strong>, decidimos quantos níveis o novo elemento vai
            ocupar de forma <strong>probabilística</strong>, normalmente com um “cara ou
            coroa”: enquanto o resultado for “cara”, o elemento é promovido para um nível
            acima. Isso produz, em média, uma distribuição de alturas parecida com a de uma
            árvore balanceada, mas com código bem mais simples.
          </p>

          <p>
            A <strong>busca</strong> começa no nó cabeça do nível mais alto. Andamos para a
            direita enquanto a próxima chave for <em>menor ou igual</em> ao alvo. Quando a
            próxima chave seria maior que o alvo (ou não existe mais ninguém à direita),
            <strong>descemos um nível</strong> mantendo a mesma coluna e repetimos o
            processo. Quando encontramos exatamente a chave procurada em algum nível, a
            busca termina; se chegarmos ao fim da lista base sem encontrá-la, sabemos que o
            elemento não está presente. :contentReference[oaicite:2]{index=2}
          </p>

          <p>
            Em termos de desempenho, a altura esperada da skip list e o número médio de nós
            visitados em uma busca são proporcionais a <strong>O(log n)</strong>, onde
            <em>n</em> é o número de elementos. Por isso, a skip list alcança, em média, o
            mesmo desempenho de árvores balanceadas, com código mais direto e uso intenso em
            <strong>indexação de bancos de dados</strong> e outras aplicações que exigem
            consultas rápidas em coleções ordenadas. :contentReference[oaicite:3]{index=3}
          </p>

          <p class="text-slate-400 text-xs">
            Texto livremente traduzido e adaptado a partir do artigo
            <a
                href="https://reintech.io/blog/understanding-implementing-skip-list-javascript"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              “Understanding and Implementing Skip List in JavaScript”
            </a>
            publicado na Reintech.
          </p>
        </div>

        <!-- ANIMAÇÃO – embaixo no mobile, à esquerda no desktop -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-4">
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-3 text-xs text-slate-600">
              <div>
                <span class="font-semibold">Alvo:</span>
                <span class="ml-1 font-semibold text-emerald-600">
                  {{ targetKey }}
                </span>
              </div>
              <button
                  type="button"
                  class="flex items-center gap-1 text-[11px] px-2 py-1 border rounded-full hover:bg-slate-50"
                  @click="startAnimation"
              >
                <i class="bi bi-arrow-clockwise"></i>
                Reiniciar animação
              </button>
            </div>

            <!-- níveis da skip list -->
            <div class="flex flex-col gap-3">
              <div
                  v-for="(row, rowIndex) in levels"
                  :key="rowIndex"
                  class="flex items-center gap-3"
              >
                <div class="w-16 text-[11px] text-right text-slate-500">
                  Nível {{ levels.length - rowIndex }}
                </div>

                <div class="flex gap-2">
                  <div
                      v-for="node in row"
                      :key="node.id"
                      :class="nodeClass(node)"
                  >
                    {{ node.key }}
                  </div>
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
