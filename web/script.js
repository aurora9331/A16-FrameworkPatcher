document.getElementById('btn-android15').onclick = function() {
    document.getElementById('android15-form').classList.add('active');
    document.getElementById('android16-form').classList.remove('active');
    this.classList.add('active');
    document.getElementById('btn-android16').classList.remove('active');
};
document.getElementById('btn-android16').onclick = function() {
    document.getElementById('android16-form').classList.add('active');
    document.getElementById('android15-form').classList.remove('active');
    this.classList.add('active');
    document.getElementById('btn-android15').classList.remove('active');
};
