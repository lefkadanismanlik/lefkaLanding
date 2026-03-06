/* Partner logos are managed here. Update only this list. */
window.partnerLogoItems = [
  { name: "Partner 01", url: "./assets/images/partners/anova.jpg" },
  { name: "Partner 02", url: "./assets/images/partners/turan.jpg" },
  { name: "Partner 03", url: "./assets/images/partners/kral.jpg" },
  { name: "Partner 04", url: "./assets/images/partners/ozturk.jpg" },
  { name: "Partner 05", url: "./assets/images/partners/majestik.jpg" },
  { name: "Partner 06", url: "./assets/images/partners/fulgent.jpg" }
];

(function () {
  var wrapper = document.getElementById("partnersSwiperWrapper");
  if (!wrapper || !Array.isArray(window.partnerLogoItems)) {
    return;
  }

  var slides = window.partnerLogoItems
    .filter(function (item) {
      return item && item.url;
    })
    .map(function (item, index) {
      var name = item.name || "Partner " + String(index + 1).padStart(2, "0");
      return (
        '<div class="swiper-slide">' +
          '<div class="partner-card">' +
            '<img src="' + item.url + '" alt="' + name + '" loading="lazy" />' +
          "</div>" +
        "</div>"
      );
    })
    .join("");

  wrapper.innerHTML = slides;
})();
