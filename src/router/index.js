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
import Account from "../views/Account.vue";
import Message from "../components/account/Message.vue";
import Profile from "../components/account/Profile.vue";
import Participation from "../components/account/Participation.vue";
import Startup from "../components/account/Startup.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Contracts from "../components/account/Contracts.vue";
import Faq from "../components/account/Faq.vue";
import Courses from "../components/account/Courses.vue";
import Favorites from "../components/account/Favorites.vue";

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
        path: "forgot-password",
        name: "ForgotPassword",
        component: ForgotPassword,
      },
      {
        path: "reset-password",
        name: "ResetPassword",
        component: ResetPassword,
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
          {
            path: "participation",
            name: "participation",
            component: Participation,
            props: (route) => {
              const tab = ["progress", "details", "records"].includes(
                route.query.tab
              )
                ? route.query.tab
                : "progress";
              return {
                entry: route.query.source === "brand" ? "brand" : "account",
                preselectTab: tab,
                brandId: route.query.brandId
                  ? Number(route.query.brandId)
                  : null,
                brandName: route.query.brandName || "",
              };
            },
          },
          {
            path: "startup",
            name: "startup",
            component: Startup,
          },
          {
            path: "contracts",
            name: "contracts",
            component: Contracts,
          },
          {
            path: "faq",
            name: "faq",
            component: Faq,
          },
          {
            path: "courses",
            name: "courses",
            component: Courses,
          },

          {
            path: "favorites",
            name: "favorites",
            component: Favorites,
          },
        ],
      },
      {
        path: "/terms",
        children: [
          {
            path: "platform",
            name: "terms-platform",
          },
          {
            path: "service",
            name: "terms-service",
          },
        ],
      },
      {
        path: "/privacy",
        name: "privacy",
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
