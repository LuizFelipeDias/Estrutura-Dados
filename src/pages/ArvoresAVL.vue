<!-- src/pages/AvlTree.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

/* --------- Nó e operações de AVL (JS adaptado do artigo da DataCamp) --------- */
let nodeIdCounter = 0

class AVLNode {
  constructor (value) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
    this._id = nodeIdCounter++
  }
}

function height (node) {
  return node ? node.height : 0
}

function updateHeight (node) {
  node.height = 1 + Math.max(height(node.left), height(node.right))
}

function balanceFactor (node) {
  return height(node.left) - height(node.right)
}

function rotateRight (y) {
  const x = y.left
  const T2 = x.right

  x.right = y
  y.left = T2

  updateHeight(y)
  updateHeight(x)

  return x
}

function rotateLeft (x) {
  const y = x.right
  const T2 = y.left

  y.left = x
  x.right = T2

  updateHeight(x)
  updateHeight(y)

  return y
}

function insertNode (node, value) {
  if (!node) return new AVLNode(value)

  if (value < node.value) {
    node.left = insertNode(node.left, value)
  } else if (value > node.value) {
    node.right = insertNode(node.right, value)
  } else {
    // ignora duplicados
    return node
  }

  updateHeight(node)
  const bf = balanceFactor(node)

  // Casos LL, RR, LR, RL
  if (bf > 1 && value < node.left.value) {
    return rotateRight(node)
  }

  if (bf < -1 && value > node.right.value) {
    return rotateLeft(node)
  }

  if (bf > 1 && value > node.left.value) {
    node.left = rotateLeft(node.left)
    return rotateRight(node)
  }

  if (bf < -1 && value < node.right.value) {
    node.right = rotateRight(node.right)
    return rotateLeft(node)
  }

  return node
}

/* --------- Layout em SVG (igual ao da BST) --------- */
function collectNodes (node, depth = 0, parent = null, acc = { index: 0 }, out = []) {
  if (!node) return out
  if (node.left) collectNodes(node.left, depth + 1, node, acc, out)

  const myIndex = acc.index++
  out.push({
    id: node._id,
    value: node.value,
    depth,
    index: myIndex,
    parentId: parent ? parent._id : null
  })

  if (node.right) collectNodes(node.right, depth + 1, node, acc, out)
  return out
}

/* --------- Estado da animação contínua --------- */
const root = ref(null)
const lastInserted = ref(null)

// sequência maior para mostrar várias rotações
const sequence = [30, 20, 10, 25, 40, 50, 22, 27, 5, 15, 35, 45, 60, 55, 65]

let timerId = null
let currentIndex = 0

function resetTree () {
  root.value = null
  lastInserted.value = null
  nodeIdCounter = 0
}

function stepInsert () {
  // quando termina a sequência, recomeça do zero
  if (currentIndex >= sequence.length) {
    currentIndex = 0
    resetTree()
  }
  const v = sequence[currentIndex++]
  if (!root.value) {
    root.value = new AVLNode(v)
  } else {
    root.value = insertNode(root.value, v)
  }
  lastInserted.value = v
}

onMounted(() => {
  // inicia animação automática
  resetTree()
  currentIndex = 0
  stepInsert() // já mostra o primeiro estado
  timerId = setInterval(stepInsert, 1400)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

/* --------- Dados para o SVG --------- */
const layoutNodes = computed(() => {
  const r = root.value
  if (!r) return []
  const raw = collectNodes(r, 0, null, { index: 0 }, [])
  if (raw.length === 0) return []

  const maxDepth = raw.reduce((m, n) => Math.max(m, n.depth), 0)
  const maxIndex = raw.reduce((m, n) => Math.max(m, n.index), 0)

  return raw.map(n => ({
    ...n,
    x: ((n.index + 1) / (maxIndex + 2)) * 80 + 10,
    y: maxDepth === 0 ? 30 : (n.depth / maxDepth) * 50 + 20
  }))
})

const edges = computed(() => {
  const map = new Map(layoutNodes.value.map(n => [n.id, n]))
  const list = []
  for (const node of layoutNodes.value) {
    if (node.parentId != null) {
      const p = map.get(node.parentId)
      if (p) {
        list.push({
          id: `${p.id}-${node.id}`,
          x1: p.x,
          y1: p.y,
          x2: node.x,
          y2: node.y
        })
      }
    }
  }
  return list
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Árvore AVL (animação automática)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        A árvore ao lado recebe, em sequência, os valores
        <span class="font-mono text-xs">
          [30, 20, 10, 25, 40, 50, 22, 27, 5, 15, 35, 45, 60, 55, 65]
        </span>
        e se rebalanceia sozinha usando rotações AVL.
      </p>

      <p class="text-center text-xs text-emerald-600 mb-4">
        Último valor inserido:
        <span v-if="lastInserted !== null" class="font-semibold">
          {{ lastInserted }}
        </span>
        <span v-else>—</span>
      </p>

      <!-- Layout: árvore + texto -->
      <div class="mt-4 flex flex-col md:flex-row gap-8 items-start">
        <!-- ÁRVORE -->
        <div class="md:w-1/2 flex justify-center order-1">
          <svg viewBox="0 0 100 80" class="w-full max-w-3xl">
            <!-- Arestas -->
            <g stroke="#4b5563" stroke-width="0.7">
              <line
                  v-for="edge in edges"
                  :key="edge.id"
                  :x1="edge.x1"
                  :y1="edge.y1"
                  :x2="edge.x2"
                  :y2="edge.y2"
              />
            </g>

            <!-- Nós -->
            <TransitionGroup name="nodes" tag="g">
              <g
                  v-for="node in layoutNodes"
                  :key="node.id"
                  class="node-group"
                  :class="{ 'node-new': node.value === lastInserted }"
              >
                <circle
                    :cx="node.x"
                    :cy="node.y"
                    r="3.2"
                    fill="#2563eb"
                />
                <text
                    :x="node.x"
                    :y="node.y"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="3"
                    fill="#f9fafb"
                    font-weight="bold"
                >
                  {{ node.value }}
                </text>
              </g>
            </TransitionGroup>
          </svg>
        </div>

        <!-- TEXTO -->
        <div class="md:w-1/2 order-2 text-sm leading-relaxed space-y-3">
          <p class="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
            O que está acontecendo na animação?
          </p>

          <p>
            Uma <strong>Árvore AVL</strong> é uma árvore de busca binária
            auto-balanceada em que, para cada nó, a diferença entre as alturas
            das subárvores esquerda e direita é no máximo 1. Sempre que uma
            inserção deixa algum nó “pesado demais” para um lado (fator de
            balanceamento 2 ou −2), a árvore executa rotações simples ou duplas
            para restaurar o equilíbrio.
          </p>

          <p>
            Na sequência que você está vendo, aparecem vários desses casos:
            por exemplo, quando 10 é inserido depois de 30 e 20, o nó 30 fica
            com fator de balanceamento +2. A rotação simples à direita transforma
            20 na nova raiz, com 10 à esquerda e 30 à direita. Mais tarde,
            inserções como 22 e 27 produzem situações de “zigue-zague”, que a
            árvore corrige com rotações duplas (esquerda-direita ou
            direita-esquerda).
          </p>

          <p>
            Esse rebalanceamento constante mantém a altura da árvore próxima de
            <strong>log₂(N)</strong>, o que garante buscas, inserções e remoções
            em tempo <strong>O(log&nbsp;n)</strong>, mesmo com muitos elementos.
            É por isso que árvores AVL são muito utilizadas em índices de banco
            de dados e estruturas que precisam de pesquisa rápida em grandes
            volumes de dados.
          </p>

          <p class="text-slate-400 text-xs">
            Texto adaptado a partir de
            <a
                href="https://www.datacamp.com/tutorial/avl-tree"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              “AVL Tree: Complete Guide With Python Implementation”
              (DataCamp, 2024)
            </a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nodes-enter-active,
.nodes-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.nodes-enter-from {
  opacity: 0;
  transform: scale(0.4);
}

.nodes-leave-to {
  opacity: 0;
  transform: scale(0.4);
}

/* nó recém-inserido “pulsa” um pouco */
.node-new circle {
  animation: nodePulse 0.8s ease-out;
}

@keyframes nodePulse {
  0% {
    transform: scale(0.4);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
