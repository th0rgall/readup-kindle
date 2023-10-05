import Page from "./reading/Page";

export function continueReadingFrom(
  page: Page,
  scrollContainer: HTMLElement,
  callback: () => void,
) {
  const scrollTop = page.getBookmarkScrollTop();
  if (scrollTop > window.innerHeight) {
    // contentRoot.style.opacity = '0';
    setTimeout(() => {
      // window.scrollTo(0, scrollTop);
      scrollContainer.scrollTo(0, scrollTop);
      callback();
      // contentRoot.style.opacity = '1';
    }, 350);
  }
}
