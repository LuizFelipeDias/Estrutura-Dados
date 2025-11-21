<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const groups = [
  {
    name: 'Árvores',
    items: [
      { label: 'Árvores AVL', name: 'arvore-avl' },
      { label: 'Árvores Binárias', name: 'arvore-binaria' },
      { label: 'Árvores Red-Black', name: 'arvore-red-black' },
    ],
  },
  {
    name: 'Buscas',
    items: [
      { label: 'Busca Binária', name: 'busca-binaria' },
      { label: 'Busca Linear', name: 'busca-linear' },
    ],
  },
  {
    name: 'Hash',
    items: [
      { label: 'Hash Dinâmico', name: 'hash-dinamico' },
      { label: 'Hash Encadeada', name: 'hash-encadeada' },
      { label: 'Hash Endereçamento Aberto', name: 'hash-enderecamento-aberto' },
    ],
  },
  {
    name: 'SkipList',
    items: [{ label: 'SkipList', name: 'skiplist' }],
  },
]

const openMobile = ref(false)
const openGroup = ref(null) // grupo aberto no desktop

const toggleMobile = () => {
  openMobile.value = !openMobile.value
}

const closeMobile = () => {
  openMobile.value = false
}

const toggleGroup = (name) => {
  openGroup.value = openGroup.value === name ? null : name
}

const closeGroups = () => {
  openGroup.value = null
}
</script>

<template>
  <nav class="w-full border-b border-gray-200 bg-white">
    <div class="max-w-6xl mx-auto px-4">
      <!-- DESKTOP -->
      <ul class="hidden md:flex items-center justify-center gap-8 py-3">
        <li
            v-for="group in groups"
            :key="group.name"
            class="relative"
        >
          <!-- Título do grupo: abre/fecha dropdown por clique -->
          <button
              class="text-sm font-semibold tracking-wide uppercase hover:text-green-500 transition"
              @click="toggleGroup(group.name)"
          >
            {{ group.name }}
          </button>

          <!-- Dropdown do grupo controlado por openGroup -->
          <ul
              class="absolute left-1/2 -translate-x-1/2 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[180px]
                   transition-opacity duration-200 z-40"
              :class="openGroup === group.name
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'"
          >
            <li
                v-for="item in group.items"
                :key="item.name"
            >
              <RouterLink
                  :to="{ name: item.name }"
                  class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="closeGroups"
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </li>
      </ul>

      <!-- MOBILE (mantém o mesmo comportamento, por clique) -->
      <div class="md:hidden py-3">
        <button
            @click="toggleMobile"
            class="flex items-center justify-between w-full px-1 py-2 text-sm font-semibold"
        >
          <span>Estruturas de Dados</span>
          <span>
            <i :class="openMobile ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </span>
        </button>

        <div
            v-if="openMobile"
            class="mt-2 bg-white rounded-lg"
        >
          <div
              v-for="group in groups"
              :key="group.name"
              class="px-4 py-3"
          >
            <p class="pb-1 text-xs font-semibold uppercase text-gray-500">
              {{ group.name }}
            </p>

            <RouterLink
                v-for="item in group.items"
                :key="item.name"
                :to="{ name: item.name }"
                class="block w-full text-left py-1.5 text-sm hover:bg-gray-50"
                @click="closeMobile"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
