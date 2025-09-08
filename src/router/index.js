import { createRouter, createWebHistory } from "vue-router";
import FrontLayout from "../layouts/FrontLayout.vue";
import BackLayout from "../layouts/BackLayout.vue";
import Home from "../views/Home.vue";
import Brand from "../views/Brand.vue";
import Cooperative from "../views/Cooperative.vue";
import About from "../views/About.vue";
import Project from "../views/Project.vue";
import Store from "../views/Store.vue";
import Star from "../views/MediaStar.vue";
import Activity from "../views/Activity.vue";
import ProjectContent from "../views/ProjectContent.vue";
import CooperativeContent from "../views/CooperativeContent.vue";
import Success from "../views/SuccessCase.vue";
import Login from "../views/Login.vue";
import EntSignUp from "../views/EntSignUp.vue";
import CoFounder from "../views/CoFounder.vue";
import Message from "../components/account/Message.vue";
import Account from "../views/Account.vue";
import Profile from "../components/account/Profile.vue";

const routes = [
  {
    path: "/",
    component: FrontLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: Home,
      },
      { path: "brand-advertising", name: "BrandAdvertising", component: Brand },
      {
        path: "cooperative-brand",
        name: "CooperativeBrand",
        component: Cooperative,
      },
      {
        path: "about",
        name: "About",
        component: About,
      },
      {
        path: "project",
        name: "Project",
        component: Project,
      },
      {
        path: "activity",
        name: "Activity",
        component: Activity,
      },
      {
        path: "star",
        name: "Star",
        component: Star,
      },
      {
        path: "success",
        name: "Success",
        component: Success,
      },
      {
        path: "store",
        name: "Store",
        component: Store,
      },
      {
        path: "project/:id",
        name: "ProjectDetail",
        component: ProjectContent,
        props: true,
      },
      {
        path: "cooperative-brand/:id",
        name: "CooperativeBrandDetail",
        component: CooperativeContent,
        props: true,
      },
    ],
  },
  {
    path: "/",
    component: BackLayout,
    children: [
      {
        path: "login",
        name: "Login",
        component: Login,
      },
      {
        path: "entSignUp",
        name: "EntSignUp",
        component: EntSignUp,
      },
      {
        path: "coFounder",
        name: "CoFounder",
        component: CoFounder,
      },
      {
        path: "account",
        component: Account,
        children: [
          { path: "", redirect: { name: "profile" } },
          { path: "profile", name: "profile", component: Profile },
          { path: "email", name: "email", component: Message },
        ],
      },
      {
        path: "/terms",
        // component: () => import("@/pages/terms/TermsLayout.vue"),
        children: [
          {
            path: "platform",
            name: "terms-platform",
            // component: () => import("@/pages/terms/Platform.vue"),
          },
          {
            path: "service",
            name: "terms-service",
            // component: () => import("@/pages/terms/Service.vue"),
          },
        ],
      },

      {
        path: "/privacy",
        name: "privacy",
        // component: () => import("@/pages/Privacy.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    return { left: 0, top: 0 };
  },
});

export default router;
