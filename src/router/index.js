import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import Home from "../views/Home.vue";
import Brand from "../views/Brand.vue";
import Cooperative from "../views/Cooperative.vue";
import About from "../views/About.vue";
import Project from "../views/Project.vue";
import Store from "../views/Store.vue";
import Star from "../views/MediaStar.vue";
import Activity from "../views/Activity.vue";
import ProjectContent from "../views/Project-content.vue";
import CooperativeContent from "../views/Cooperative-content.vue";
import Success from "../views/SuccessCase.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
