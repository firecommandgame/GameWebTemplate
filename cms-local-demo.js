
const form = document.getElementById("postForm");

if(form){
  form.addEventListener("submit", e => {
    e.preventDefault();

    const post = {
      id: Date.now().toString(),
      title: document.getElementById("title").value,
      category: document.getElementById("category").value,
      image: document.getElementById("image").value,
      body: document.getElementById("body").value,
      status: document.getElementById("status").value,
      createdAt: new Date().toISOString()
    };

    const posts = JSON.parse(localStorage.getItem("hotelGamesPosts") || "[]");
    posts.unshift(post);
    localStorage.setItem("hotelGamesPosts", JSON.stringify(posts));

    alert("Post saved.");
    form.reset();
  });
}

function loadPosts(category){
  const container = document.getElementById("posts");
  if(!container) return;

  const posts = JSON.parse(localStorage.getItem("hotelGamesPosts") || "[]")
    .filter(post => post.category === category && post.status === "published");

  if(posts.length === 0){
    container.innerHTML = "<p class='small'>No posts yet. Create one from admin.html.</p>";
    return;
  }

  container.innerHTML = posts.map(post => `
    <article class="card">
      ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ""}
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <p class="small">${new Date(post.createdAt).toLocaleDateString()}</p>
    </article>
  `).join("");
}
