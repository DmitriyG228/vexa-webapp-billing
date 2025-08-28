// Add the copy functionality script to the page
export const addCopyScript = () => `
<script>
// Global copy function
window.copyCodeToClipboard = async function(button, code) {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    // Update button to show success state
    const originalHTML = button.innerHTML;
    button.innerHTML = \`
      <svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    \`;
    button.classList.add('text-green-400');
    button.classList.remove('text-zinc-300');
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('text-green-400');
      button.classList.add('text-zinc-300');
    }, 2000);
    
  } catch (err) {
    console.error('Failed to copy code:', err);
    // Show error state briefly
    const originalHTML = button.innerHTML;
    button.innerHTML = \`
      <svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    \`;
    button.classList.add('text-red-400');
    button.classList.remove('text-zinc-300');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('text-red-400');
      button.classList.add('text-zinc-300');
    }, 2000);
  }
};

// Initialize copy buttons when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Copy button script loaded');
});
</script>
`;
