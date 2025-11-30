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
import AccountSales from "../views/AccountSales.vue";
import Member from "../components/account-sales/Member.vue";
import Management from "../components/account-sales/Management.vue";
import Sales from "../components/account-sales/Sales.vue";
import Notifications from "../components/account-sales/Notifications.vue";
import Bonus from "../components/account-sales/Bonus.vue";
import Records from "../components/account-sales/Records.vue";
import Assessment from "../components/account-sales/Assessment.vue";
import Chart from "../components/account-sales/Chart.vue";
import SuccessContent from "../views/SuccessCaseContent.vue";
import StarContent from "../views/MediaStarContent.vue";
import Platform from "../views/Platform.vue";
import TermsService from "../views/TermsService.vue";
import Privacy from "../views/Privacy.vue";
import Soon from "../views/Soon.vue";
import RiskNotice from "../views/RiskNotice.vue";

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
        path: "star/:id",
        name: "starDetail",
        component: StarContent,
        props: true,
      },
      {
        path: "success",
        name: "Success",
        component: Success,
      },
      {
        path: "success/:id",
        name: "SuccessDetail",
        component: SuccessContent,
        props: true,
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
      {
        path: "/terms",
        children: [
          {
            path: "platform",
            name: "terms-platform",
            component: Platform,
          },
          {
            path: "service",
            name: "terms-service",
            component: TermsService,
          },
          {
            path: "risk",
            name: "terms-risk",
            component: RiskNotice,
          },
        ],
      },
      {
        path: "/privacy",
        name: "privacy",
        component: Privacy,
      },
      {
        path: "/soon",
        name: "soon",
        component: Soon,
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
        path: "account-sales",
        component: AccountSales,
        children: [
          { path: "", redirect: { name: "member" } },
          { path: "member", name: "member", component: Member },
          { path: "sales", name: "sales", component: Sales },
          { path: "management", name: "management", component: Management },
          {
            path: "notifications",
            name: "notifications",
            component: Notifications,
          },
          { path: "bonus", name: "bonus", component: Bonus },
          { path: "records", name: "records", component: Records },
          { path: "assessment", name: "assessment", component: Assessment },
          { path: "chart", name: "chart", component: Chart },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    if (savedPosition) return savedPosition;
    return { left: 0, top: 0 };
  },
});

export default router;
