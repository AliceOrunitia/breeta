window.addEventListener("DOMContentLoaded", (event) => {
  const sidebarToggle = document.body.querySelector("#sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", (event) => {
      event.preventDefault();
      document.body.classList.toggle("sb-sidenav-toggled");
      localStorage.setItem(
        "sb|sidebar-toggle",
        document.body.classList.contains("sb-sidenav-toggled")
      );
    });
    let touchstartX = 0;
    let touchendX = 0;

    function checkDirection() {
      if (touchendX + 150 < touchstartX) {
        document.body.classList.remove("sb-sidenav-toggled");
      }
      if (touchendX - 150 > touchstartX) {
        document.body.classList.add("sb-sidenav-toggled");
      }
    }

    document.addEventListener("touchstart", (e) => {
      touchstartX = e.changedTouches[0].screenX;
    });

    document.addEventListener("touchend", (e) => {
      touchendX = e.changedTouches[0].screenX;
      checkDirection();
    });
  }
});

// let sidebar = document.querySelector("#sidebar-wrapper");
// let sidebar_content = document.querySelector("#tester");
// window.onscroll = () => {
//   let scrollTop = window.scrollY; // current scroll position
//   let viewportHeight = window.innerHeight; //viewport height
//   let contentHeight = sidebar_content.getBoundingClientRect().height; // current content height
//   let sidebarTop = sidebar.getBoundingClientRect().top + window.pageYOffset; //distance from top to sidebar
//   if (scrollTop >= contentHeight - viewportHeight + sidebarTop) {
//     sidebar_content.style.transform = `translateY(-${
//       contentHeight - viewportHeight + sidebarTop
//     }px)`;
//     sidebar_content.style.position = "fixed";
//   } else {
//     sidebar_content.style.transform = "";
//     sidebar_content.style.position = "";
//   }
// };
