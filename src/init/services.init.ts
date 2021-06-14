import { FAQCategory, FAQItem, Instruction } from "../models";

(async () => {
  try {
    console.log("Запуск скрипта переноса инструкций и faq от одного дома к другому");
    const houseIdsource = 1;
    const houseIddesctination = 2;
    
    const instructions = await Instruction.findAll({ where: { houseId: houseIdsource } });
    if (instructions != null) {
      for (let instruction of instructions) {
        await Instruction.create({
          houseId: houseIddesctination,
          title: instruction.title,
          subtitle: instruction.subtitle,
          body: instruction.body
        });
      }
    }

    const faqCategories = await FAQCategory.findAll({ where: { houseId: houseIdsource } });
    if (faqCategories != null) {
      for (let faqCategory of faqCategories) {
        const category = await FAQCategory.create({ houseId: houseIddesctination, name: faqCategory.name, description: faqCategory.description });
        const faqItems = await FAQItem.findAll({ where: { categoryId: faqCategory.id } });
        if (faqItems != null) {
          for (let faqItem of faqItems) {
            await FAQItem.create({
              categoryId: category.id,
              title: faqItem.title,
              body: faqItem.body
          });
          }
        }
      }
    }

    console.log("Завершение скрипта");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();