<template>
  <div class="accordion" id="accordionExample">
    <div
      class="accordion-item"
      v-for="(item, index) in accordionItems"
      :key="index"
    >
      <h2 class="accordion-header" :id="`heading${index}`">
        <button
          class="accordion-button"
          :class="{ collapsed: index !== 0 }"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#collapse${index}`"
          :aria-expanded="index === 0 ? 'true' : 'false'"
          :aria-controls="`collapse${index}`"
        >
          {{ item.title }}
        </button>
      </h2>
      <div
        :id="`collapse${index}`"
        class="accordion-collapse collapse"
        :class="{ show: index === 0 }"
        :aria-labelledby="`heading${index}`"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const accordionItems = [
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
  {
    title: "Blishing industries for previewing layouts and visual mockups?",
    content:
      "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
  },
];
</script>

<style scoped lang="scss">
.accordion-item:first-of-type > .accordion-header .accordion-button,
.accordion-item:last-of-type > .accordion-header .accordion-button.collapsed {
  border-radius: 20px;
}

.accordion {
  gap: 15px;
  display: grid;
}

.accordion-button {
  position: relative;
  padding-right: 2rem;
  font-size: 18px;
  font-weight: 600;
  color: #373a36;
  border-radius: 20px;
  box-shadow: 2px 2px 9px rgba(55, 58, 54, 0.5);
  @media (max-width: 576px) {
    font-size: 17px;
  }
  &::after {
    content: "+";
    font-size: 1.5rem;
    font-weight: bold;
    position: absolute;
    right: 1rem;
    top: 45%;
    transform: translateY(-50%);
    background-image: none !important;
  }

  &:not(.collapsed)::after {
    content: "−";
    transform: translateY(-50%);
  }

  &:not(.collapsed) {
    color: #fff;
    background-color: #ff6634;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}

.accordion-item {
  border: none;
  background: rgba(255, 255, 255, 0.8);
}

.accordion-body {
  box-shadow: 2px 2px 9px rgba(55, 58, 54, 0.5);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  font-weight: 400;
  color: #373a36;
  padding: 0.25rem 1.25rem 1rem 1.25rem;
}
</style>
