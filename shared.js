// Sharma Sir's Digital Lab — shared.js
(function () {
  // Navbar scroll
  const nav = document.getElementById('navbar');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));

  // Hamburger
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mobNav');
  if (ham && mob) {
    ham.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { ham.classList.remove('open'); mob.classList.remove('open'); }));
  }

  // Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Stagger children
  document.querySelectorAll('.stagger > *').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 80}ms`;
  });
})();
