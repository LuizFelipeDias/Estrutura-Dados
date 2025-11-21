<script setup>
import { ref, computed } from 'vue'

/* ------------ Classe BST ------------ */
let nodeIdCounter = 0

class BST {
  constructor(value, right = null, left = null) {
    this.value = value
    this.right = right
    this.left = left
    this._id = nodeIdCounter++ // id único para cada nó
  }

  insert(value) {
    // NÃO PERMITIR DUPLICADOS
    if (value === this.value) return this

    if (value > this.value) {
      if (this.right) {
        this.right.insert(value)
      } else {
        this.right = new BST(value)
      }
    } else {
      if (this.left) {
        this.left.insert(value)
      } else {
        this.left = new BST(value)
      }
    }
    return this
  }

  contains(value) {
    if (value === this.value) return true
    if (value > this.value) {
      return this.right ? this.right.contains(value) : false
    } else {
      return this.left ? this.left.contains(value) : false
    }
  }

  getMinValue() {
    if (this.left) return this.left.getMinValue()
    return this.value
  }

  remove(value, parent = null) {
    if (value > this.value) {
      if (this.right) this.right.remove(value, this)
    } else if (value < this.value) {
      if (this.left) this.left.remove(value, this)
    } else {
      // achou
      if (this.left && this.right) {
        this.value = this.right.getMinValue()
        this.right.remove(this.value, this)
      } else if (!parent) {
        if (this.left) {
          this.value = this.left.value
          this.right = this.left.right
          this.left = this.left.left
        } else if (this.right) {
          this.value = this.right.value
          this.right = this.right.right
          this.left = this.right.left
        } else {
          // árvore só com a raiz
        }
      } else if (parent.left === this) {
        parent.left = this.left ? this.left : this.right
      } else if (parent.right === this) {
        parent.right = this.right ? this.right : this.left
      }
    }
    return this
  }

  toLayoutNodes(nodes = [], depth = 0, parent = null, acc = { index: 0 }) {
    if (this.left) this.left.toLayoutNodes(nodes, depth + 1, this, acc)

    const myIndex = acc.index++
    nodes.push({
      id: this._id,
      value: this.value,
      depth,
      index: myIndex,
      parentId: parent ? parent._id : null,
    })

    if (this.right) this.right.toLayoutNodes(nodes, depth + 1, this, acc)
    return nodes
  }
}

/* ------------ Estado do componente ------------ */
const root = ref(null)
const valueToInsert = ref('')
const valueToRemove = ref('')
const lastInserted = ref(null)

/* Árvore inicial numérica (bem balanceada) */
function initTree() {
  const vals = [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]
  root.value = new BST(vals[0])
  for (let i = 1; i < vals.length; i++) {
    root.value.insert(vals[i])
  }
}
initTree()

/* ------------ Layout para o SVG ------------ */
const layoutNodes = computed(() => {
  if (!root.value) return []
  const raw = root.value.toLayoutNodes([], 0, null, { index: 0 })
  if (raw.length === 0) return []

  const maxDepth = raw.reduce((m, n) => Math.max(m, n.depth), 0)
  const maxIndex = raw.reduce((m, n) => Math.max(m, n.index), 0)

  return raw.map((n) => ({
    ...n,
    x: ((n.index + 1) / (maxIndex + 2)) * 80 + 10,
    y: maxDepth === 0 ? 20 : (n.depth / maxDepth) * 60 + 10,
  }))
})

const edges = computed(() => {
  const map = new Map(layoutNodes.value.map((n) => [n.id, n]))
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
          y2: node.y,
        })
      }
    }
  }
  return list
})

/* ------------ Ações ------------ */
function handleInsert() {
  const v = Number(valueToInsert.value)
  if (Number.isNaN(v)) return

  if (!root.value) {
    root.value = new BST(v)
  } else {
    root.value.insert(v)
  }

  valueToInsert.value = ''
  lastInserted.value = v
  setTimeout(() => {
    if (lastInserted.value === v) lastInserted.value = null
  }, 800)
}

function handleRemove() {
  const v = Number(valueToRemove.value)
  if (Number.isNaN(v) || !root.value) return
  root.value.remove(v)
  valueToRemove.value = ''
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white text-slate-900">
    <div class="max-w-6xl w-full px-4 py-8">
      <h1 class="text-2xl font-bold mb-2 text-center">
        Árvore Binária de Busca (visualização interativa)
      </h1>
      <p class="text-center text-sm text-slate-500 mb-6">
        Insira ou remova valores numéricos e veja como a estrutura da árvore se reorganiza.
      </p>

      <!-- Layout texto + árvore -->
      <div class="mt-8 flex flex-col md:flex-row gap-8 items-start">
        <!-- TEXTO -->
        <div class="md:w-1/2 order-1 md:order-2 text-sm leading-relaxed space-y-3">
          <p>
            Uma Árvore Binária de Busca é formada por nós que podem ter, no máximo, dois filhos:
            um à esquerda e outro à direita. Cada nó armazena um valor, e a grande sacada está na
            organização desses valores: todos os elementos à esquerda de um nó são menores que ele,
            e todos os elementos à direita são maiores. Essa propriedade é o que permite realizar
            buscas, inserções e remoções de forma muito mais eficiente do que em uma lista simples.
          </p>

          <p>
            Quando a árvore está bem estruturada, o custo médio para encontrar um elemento é
            proporcional a <strong>O(log n)</strong>, onde <em>n</em> é a quantidade de nós.
            Em termos práticos, isso significa que, mesmo com muitos elementos armazenados,
            o número de comparações cresce de forma bem lenta. Por outro lado, se a árvore
            ficar muito “torta” (desequilibrada), o desempenho pode se aproximar de uma lista,
            chegando a <strong>O(n)</strong> no pior caso.
          </p>

          <p>
            Na visualização ao lado, cada bolinha representa um nó da árvore, e os números
            <strong>aparecem dentro das bolinhas</strong>, indicando o valor armazenado naquele nó.
            As linhas ligando os nós mostram as relações pai&nbsp;→&nbsp;filho. Ao inserir um novo valor,
            ele “desce” pela árvore: vai para a esquerda se for menor que o nó atual, ou para a
            direita se for maior ou igual, até encontrar uma posição vaga. Ao remover, a estrutura
            se reorganiza para preservar a propriedade de busca.
          </p>

          <p>
            Árvores Binárias de Busca aparecem o tempo todo na prática: na implementação de
            dicionários, tabelas de símbolos, mecanismos de busca, filtros por intervalo de valores
            e em qualquer cenário em que seja preciso combinar <strong>ordenação</strong> com
            <strong>busca rápida</strong>. Dominar esse conceito é um passo essencial para quem quer
            aprofundar os estudos em algoritmos e estruturas de dados.
          </p>

          <p class="text-slate-500 text-xs">
            Este conteúdo faz parte do material que disponibilizo para os participantes do meu
            grupo de estudos de Algoritmos e Estruturas de Dados.
          </p>

          <p class="text-slate-400 text-xs">
            Parte da fundamentação teórica foi inspirada no artigo
            <a
                href="https://elemarjr.com/clube-de-estudos/artigos/introducao-a-arvore-binaria-conceitos-terminologias-e-implementacao/"
                target="_blank"
                rel="noopener noreferrer"
                class="underline hover:text-slate-600"
            >
              “Introdução à Árvore Binária: conceitos, terminologias e implementação”
            </a>
            do site ElemarJR.
          </p>
        </div>

        <!-- CONTROLES + ÁRVORE (mesma coluna) -->
        <div class="md:w-1/2 order-2 md:order-1 flex flex-col gap-4">
          <!-- Controles em cima da árvore -->
          <div class="flex flex-col gap-3">
            <div>
              <p class="text-xs font-semibold uppercase text-slate-500 mb-1">
                Valor para inserir
              </p>
              <div class="flex items-center gap-3">
                <input
                    v-model="valueToInsert"
                    type="text"
                    class="px-3 py-2 rounded-none border border-slate-300 text-slate-900
                         focus:outline-none focus:ring-0 focus:border-slate-400"
                />
                <button
                    @click="handleInsert"
                    class="pb-1 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-500
                         hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  Inserir
                </button>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase text-slate-500 mb-1">
                Valor para remover
              </p>
              <div class="flex items-center gap-3">
                <input
                    v-model="valueToRemove"
                    type="text"
                    class="px-3 py-2 rounded-none border border-slate-300 text-slate-900
                         focus:outline-none focus:ring-0 focus:border-slate-400"
                />
                <button
                    @click="handleRemove"
                    class="pb-1 text-sm font-semibold text-rose-600 border-b-2 border-rose-500
                         hover:border-rose-400 hover:text-rose-700 transition"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- SVG da árvore -->
          <div class="flex justify-center">
            <svg
                viewBox="0 0 100 80"
                class="w-full max-w-3xl"
            >
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
