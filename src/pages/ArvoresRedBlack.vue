<!-- src/pages/ArvoreRubroNegra.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

/* --------- Nó e operações de Árvore Rubro-Negra --------- */

let nodeIdCounter = 0

class RBNode {
  constructor (value) {
    this.value = value
    this.color = 'R' // 'R' = vermelho, 'B' = preto
    this.left = null
    this.right = null
    this.parent = null
    this._id = nodeIdCounter++
  }
}

const root = ref(null)
const lastInserted = ref(null)

// sequência fixa só para mostrar bem as rotações / recolorações
const sequence = [20, 15, 25, 10, 5, 1, 18, 30, 28, 40, 35, 50]

let timerId = null
let currentIndex = 0

function resetTree () {
  root.value = null
  lastInserted.value = null
  nodeIdCounter = 0
}

/* ---- rotações que atualizam ponteiros e a raiz ---- */

function rotateLeft (x) {
  const y = x.right
  if (!y) return

  x.right = y.left
  if (y.left) y.left.parent = x

  y.left = x
  const p = x.parent
  x.parent = y
  y.parent = p

  if (!p) {
    root.value = y
  } else if (p.left === x) {
    p.left = y
  } else {
    p.right = y
  }
}

function rotateRight (y) {
  const x = y.left
  if (!x) return

  y.left = x.right
  if (x.right) x.right.parent = y

  x.right = y
  const p = y.parent
  y.parent = x
  x.parent = p

  if (!p) {
    root.value = x
  } else if (p.left === y) {
    p.left = x
  } else {
    p.right = x
  }
}

/* ---- inserção RB padrão + correção de cores/rotações ---- */

function rbInsert (value) {
  let y = null
  let x = root.value

  // inserção BST normal
  while (x) {
    y = x
    if (value < x.value) {
      x = x.left
    } else if (value > x.value) {
      x = x.right
    } else {
      // ignora valores duplicados
      return null
    }
  }

  const z = new RBNode(value)
  z.parent = y

  if (!y) {
    root.value = z
  } else if (value < y.value) {
    y.left = z
  } else {
    y.right = z
  }

  fixInsert(z)
  return z
}

function fixInsert (z) {
  // enquanto pai é vermelho, precisamos corrigir
  while (z.parent && z.parent.color === 'R') {
    const p = z.parent
    const g = p.parent

    if (!g) break

    if (p === g.left) {
      const u = g.right // tio
      // Caso 3: pai e tio vermelhos -> recoloração
      if (u && u.color === 'R') {
        p.color = 'B'
        u.color = 'B'
        g.color = 'R'
        z = g
      } else {
        // tio preto / nulo -> rotações
        if (z === p.right) {
          // Caso 4: z é filho direito -> rotação esquerda no pai
          z = p
          rotateLeft(z)
        }
        // Caso 5: rotação direita no avô + troca de cores
        z.parent.color = 'B'
        g.color = 'R'
        rotateRight(g)
      }
    } else {
      // simétrico: pai é filho direito do avô
      const u = g.left
      if (u && u.color === 'R') {
        p.color = 'B'
        u.color = 'B'
        g.color = 'R'
        z = g
      } else {
        if (z === p.left) {
          z = p
          rotateRight(z)
        }
        z.parent.color = 'B'
        g.color = 'R'
        rotateLeft(g)
      }
    }
  }

  if (root.value) {
    root.value.color = 'B' // raiz sempre preta
  }
}

/* --------- Animação automática --------- */

function stepInsert () {
  if (currentIndex >= sequence.length) {
    currentIndex = 0
    resetTree()
  }
  const v = sequence[currentIndex++]
  const node = rbInsert(v)
  if (node) {
    lastInserted.value = v
    setTimeout(() => {
      if (lastInserted.value === v) lastInserted.value = null
    }, 800)
  } else {
    // se tentou inserir duplicado, avança de novo
    stepInsert()
  }
}

onMounted(() => {
  resetTree()
  currentIndex = 0
  stepInsert()
  timerId = setInterval(stepInsert, 1500)
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

/* --------- Layout da árvore em SVG (igual aos outros) --------- */

function collectNodes (node, depth = 0, parent = null, acc = { index: 0 }, out = []) {
  if (!node) return out
  if (node.left) collectNodes(node.left, depth + 1, node, acc, out)

  const myIndex = acc.index++
  out.push({
    id: node._id,
    value: node.value,
    color: node.color,
    depth,
    index: myIndex,
    parentId: parent ? parent._id : null
  })

  if (node.right) collectNodes(node.right, depth + 1, node, acc, out)
  return out
}

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
        Árvore Rubro-Negra (visualização automática)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-4">
        Os nós em <span class="font-semibold text-red-600">vermelho</span> e
        <span class="font-semibold text-slate-900">preto</span> mostram como a árvore
        se mantém aproximadamente balanceada enquanto novos valores são inseridos.
      </p>

      <p class="text-center text-xs text-emerald-600 mb-4">
        Último valor inserido:
        <span v-if="lastInserted !== null" class="font-semibold">
          {{ lastInserted }}
        </span>
        <span v-else>—</span>
      </p>

      <!-- layout: árvore + texto -->
      <div class="mt-4 flex flex-col md:flex-row gap-8 items-start">
        <!-- ÁRVORE -->
        <div class="md:w-1/2 flex justify-center order-1">
          <svg viewBox="0 0 100 80" class="w-full max-w-3xl">
            <!-- arestas -->
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

            <!-- nós -->
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
                    :fill="node.color === 'R' ? '#dc2626' : '#111827'"
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
            O que é uma árvore rubro-negra?
          </p>

          <p>
            Uma <strong>árvore rubro-negra</strong> é uma árvore de busca binária
            balanceada em que cada nó interno é colorido de vermelho ou preto. Ela
            mantém a altura da árvore controlada, garantindo que operações de
            <strong>busca, inserção e remoção</strong> ocorram em tempo
            <strong>O(log&nbsp;n)</strong>, mesmo no pior caso.
          </p>

          <p>
            Além das regras normais de uma BST (valores menores à esquerda,
            maiores à direita), a árvore obedece a cinco propriedades extras:
          </p>

          <ul class="list-disc pl-5 space-y-1">
            <li>Cada nó é <strong>vermelho</strong> ou <strong>preto</strong>.</li>
            <li>A <strong>raiz é sempre preta</strong>.</li>
            <li>Todas as folhas nulas (NIL) são pretas.</li>
            <li>Se um nó é vermelho, <strong>seus filhos são pretos</strong>.</li>
            <li>
              Todo caminho de um nó até qualquer folha contém o
              <strong>mesmo número de nós pretos</strong>
              (mesma “altura preta”).
            </li>
          </ul>

          <p>
            Essas regras fazem com que o caminho mais longo da raiz até uma folha
            nunca seja mais do que o dobro do caminho mais curto. Em outras
            palavras, a árvore fica sempre “quase” balanceada, o que mantém a
            altura proporcional a log₂(n).
          </p>

          <p class="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
            O que a animação está mostrando?
          </p>

          <p>
            Na animação, novos valores são inseridos na árvore em ordem fixa. Cada
            novo nó começa <strong>vermelho</strong>. Se isso quebrar alguma das
            propriedades (por exemplo, dois nós vermelhos seguidos), o algoritmo:
          </p>

          <ul class="list-disc pl-5 space-y-1">
            <li>
              <strong>Recolore</strong> nós (pai, tio, avô) quando possível,
              corrigindo apenas as cores.
            </li>
            <li>
              Faz <strong>rotações à esquerda ou à direita</strong> quando a
              árvore fica torta, aproximando-a de uma árvore perfeitamente
              balanceada.
            </li>
          </ul>

          <p>
            As bolinhas <span class="text-red-600 font-semibold">vermelhas</span>
            representam nós que podem ter apenas filhos pretos. As bolinhas
            <span class="font-semibold">pretas</span> contam para a “altura preta”
            em todos os caminhos. A combinação de rotações e recolorações é o que
            permite à árvore rubro-negra manter desempenho garantido de
            <strong>O(log&nbsp;n)</strong> para todas as operações básicas.
          </p>

          <p class="text-slate-400 text-xs">
            Texto adaptado a partir do artigo
            <em>“Árvore rubro-negra”</em>, disponível na Wikipédia em português:
            <a
                href="https://pt.wikipedia.org/wiki/%C3%81rvore_rubro-negra"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              pt.wikipedia.org/wiki/Árvore_rubro-negra
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

/* destaque do nó recém inserido (pulso) */
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
