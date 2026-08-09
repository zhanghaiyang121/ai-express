/**
 * Vue Router 4 Routing Configuration
 */
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

NProgress.configure({ showSpinner: false, minimum: 0.2, easing: 'ease', speed: 500 })

export const constantRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue'), meta: { title: 'Login' } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/login/forgot-password.vue'), meta: { title: 'Forgot Password' } },
  { path: '/404', name: 'Forbidden', component: () => import('@/views/404.vue'), meta: { title: 'Forbidden' } },
  { path: '/', name: 'Layout', component: () => import('@/layout/index.vue'), redirect: '/dashboard', children: [] },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/404.vue'), meta: { title: '404' } }
]

export const asyncRoutes: RouteRecordRaw[] = [
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: 'Dashboard', icon: 'Odometer' } },
  {
    path: '/goods', name: 'Goods', redirect: '/goods/list', meta: { title: 'Goods', icon: 'Goods' }, children: [
      { path: 'list', name: 'GoodsList', component: () => import('@/views/goods/list.vue'), meta: { title: 'Goods List' } },
      { path: 'publish', name: 'GoodsPublish', component: () => import('@/views/goods/publish.vue'), meta: { title: 'Publish', hidden: true } },
      { path: 'category', name: 'GoodsCategory', component: () => import('@/views/goods/category.vue'), meta: { title: 'Category' } },
      { path: 'brand', name: 'GoodsBrand', component: () => import('@/views/goods/brand.vue'), meta: { title: 'Brand' } }
    ]
  },
  {
    path: '/order', name: 'Order', redirect: '/order/list', meta: { title: 'Orders', icon: 'List' }, children: [
      { path: 'list', name: 'OrderList', component: () => import('@/views/order/list.vue'), meta: { title: 'Order List' } },
      { path: 'detail/:id', name: 'OrderDetail', component: () => import('@/views/order/detail.vue'), meta: { title: 'Detail', hidden: true } },
      { path: 'refund', name: 'OrderRefund', component: () => import('@/views/order/refund.vue'), meta: { title: 'Refund' } }
    ]
  },
  {
    path: '/user', name: 'User', redirect: '/user/list', meta: { title: 'Users', icon: 'UserFilled' }, children: [
      { path: 'list', name: 'UserList', component: () => import('@/views/user/list.vue'), meta: { title: 'User List' } },
      { path: 'detail/:id', name: 'UserDetail', component: () => import('@/views/user/detail.vue'), meta: { title: 'Detail', hidden: true } },
      { path: 'tag', name: 'UserTag', component: () => import('@/views/user/tag.vue'), meta: { title: 'Tags' } }
    ]
  },
  {
    path: '/marketing', name: 'Marketing', redirect: '/marketing/coupon', meta: { title: 'Marketing', icon: 'Present' }, children: [
      { path: 'coupon', name: 'MarketingCoupon', component: () => import('@/views/marketing/coupon.vue'), meta: { title: 'Coupons' } },
      { path: 'group', name: 'MarketingGroup', component: () => import('@/views/marketing/group.vue'), meta: { title: 'Group Buy' } },
      { path: 'flash', name: 'MarketingFlash', component: () => import('@/views/marketing/flash.vue'), meta: { title: 'Flash Sale' } }
    ]
  },
  {
    path: '/content', name: 'Content', redirect: '/content/article', meta: { title: 'Content', icon: 'Document' }, children: [
      { path: 'article', name: 'ContentArticle', component: () => import('@/views/content/article.vue'), meta: { title: 'Articles' } },
      { path: 'editor', name: 'ContentEditor', component: () => import('@/views/content/editor.vue'), meta: { title: 'Editor', hidden: true } },
      { path: 'comment', name: 'ContentComment', component: () => import('@/views/content/comment.vue'), meta: { title: 'Comments' } }
    ]
  },
  {
    path: '/finance', name: 'Finance', redirect: '/finance/transaction', meta: { title: 'Finance', icon: 'Money' }, children: [
      { path: 'transaction', name: 'FinanceTransaction', component: () => import('@/views/finance/transaction.vue'), meta: { title: 'Transactions' } },
      { path: 'withdraw', name: 'FinanceWithdraw', component: () => import('@/views/finance/withdraw.vue'), meta: { title: 'Withdrawals' } },
      { path: 'reconciliation', name: 'FinanceReconciliation', component: () => import('@/views/finance/reconciliation.vue'), meta: { title: 'Reconciliation' } }
    ]
  },
  {
    path: '/stats', name: 'Stats', redirect: '/stats/sales', meta: { title: 'Statistics', icon: 'DataAnalysis' }, children: [
      { path: 'sales', name: 'StatsSales', component: () => import('@/views/stats/sales.vue'), meta: { title: 'Sales' } },
      { path: 'user', name: 'StatsUser', component: () => import('@/views/stats/user.vue'), meta: { title: 'User Analysis' } },
      { path: 'goods', name: 'StatsGoods', component: () => import('@/views/stats/goods.vue'), meta: { title: 'Goods Analysis' } }
    ]
  },
  {
    path: '/system', name: 'System', redirect: '/system/config', meta: { title: 'System', icon: 'Setting' }, children: [
      { path: 'config', name: 'SystemConfig', component: () => import('@/views/system/config.vue'), meta: { title: 'Config' } },
      { path: 'role', name: 'SystemRole', component: () => import('@/views/system/role.vue'), meta: { title: 'Roles' } },
      { path: 'log', name: 'SystemLog', component: () => import('@/views/system/log.vue'), meta: { title: 'Logs' } },
      { path: 'notification', name: 'SystemNotification', component: () => import('@/views/system/notification.vue'), meta: { title: 'Notifications' } }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

const whiteList = ['/login', '/forgot-password', '/403', '/404']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const token = getToken()
  if (token) {
    if (to.path === '/login') { next({ path: '/' }); NProgress.done(); return }
    const userStore = useUserStore()
    if (!userStore.userInfo) {
      try { await userStore.getUserInfo(); next({ ...to, replace: true }) }
      catch { userStore.resetState(); next('/login?redirect=' + to.path) }
    } else { next() }
  } else {
    if (whiteList.includes(to.path)) { next() }
    else { next('/login?redirect=' + to.path) }
  }
})

router.afterEach(() => { NProgress.done() })
export default router