import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import ArvoresB from '@/pages/ArvoresB.vue'
import ArvoresAVL from '@/pages/ArvoresAVL.vue'
import ArvoresRedBlack from '@/pages/ArvoresRedBlack.vue'
import BuscaBinaria from '@/pages/BuscaBinaria.vue'
import BuscaLinear from '@/pages/BuscaLinear.vue'
import HashDinamico from '@/pages/HashDinamico.vue'
import HashEncadeada from '@/pages/HashEncadeada.vue'
import HashEnderecamentoAberto from '@/pages/HashEnderecamentoAberto.vue'
import SkipList from '@/pages/SkipList.vue'

const routes = [
    { path: '/', name: 'home', component: Home },

    { path: '/arvore-avl', name: 'arvore-avl', component: ArvoresAVL },
    { path: '/arvore-binaria', name: 'arvore-binaria', component: ArvoresB },
    { path: '/arvore-red-black', name: 'arvore-red-black', component: ArvoresRedBlack },

    { path: '/busca-binaria', name: 'busca-binaria', component: BuscaBinaria },
    { path: '/busca-linear', name: 'busca-linear', component: BuscaLinear },

    { path: '/hash-dinamico', name: 'hash-dinamico', component: HashDinamico },
    { path: '/hash-encadeada', name: 'hash-encadeada', component: HashEncadeada },
    { path: '/hash-enderecamento-aberto', name: 'hash-enderecamento-aberto', component: HashEnderecamentoAberto},

    { path: '/skiplist', name: 'skiplist', component: SkipList },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
