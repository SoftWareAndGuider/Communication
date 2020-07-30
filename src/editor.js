const editor = editormd('editor', {
  path: '/node_modules/editor.md/lib/',
  width: '100%',
  height: '50vh',
  toolbarAutoFixed: false,
  toolbarIcons: "simple",
  // mode: 'markdown',
  tabSize: 2,
  placeholder: '이곳에 게시글을 작성해보세요... (디코 문법 적용)',
  watch: false
})
