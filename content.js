function addPasteButton() {
  // දැනටමත් button එක දාලා නම් ආයෙත් දාන්නේ නෑ
  if (document.getElementById("gt-custom-paste-btn")) return;

  const textarea = document.querySelector('textarea[aria-label="Source text"]') || document.querySelector("textarea");
  if (!textarea || !textarea.parentElement) return;

  const container = textarea.parentElement;
  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  const pasteBtn = document.createElement("button");
  pasteBtn.id = "gt-custom-paste-btn";
  pasteBtn.type = "button";

  // Text box එක හිස් නම් විතරක් button එක පෙන්නන්න
  const updateVisibility = () => {
    if (textarea.value.trim().length > 0) {
      pasteBtn.style.display = "none";
    } else {
      pasteBtn.style.display = "block";
    }
  };

  pasteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      // Google Translate එකට text එක වෙනස් වුණා කියලා දැනෙන්න native setter එක පාවිච්චි කරනවා
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      ).set;

      nativeSetter.call(textarea, text);
      textarea.focus();
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      updateVisibility();
    } catch (err) {
      alert("Paste කරන්න Clipboard access allow කරන්න ඕන.");
      console.error("Paste failed:", err);
    }
  });

  // User type කරද්දි හරි clear කරද්දි හරි button එක hide/show වෙන්න
  textarea.addEventListener("input", updateVisibility);
  
  // Clear (X) button එක click කරාම check වෙන්න interval එකක්
  const observer = new MutationObserver(updateVisibility);
  observer.observe(textarea, { attributes: true, childList: true, characterData: true });

  // Clear button click catch කරගන්න
  document.addEventListener("click", () => setTimeout(updateVisibility, 100));

  container.appendChild(pasteBtn);
  updateVisibility();
}

// Page එක load වෙද්දි සහ tabs මාරු කරද්දි button එක තියාගන්න
const pageObserver = new MutationObserver(() => {
  addPasteButton();
});

pageObserver.observe(document.body, { childList: true, subtree: true });
addPasteButton();