## BUGS ##

- [ ] 2 click to search images through API (first click always return no results, can't quite put my finger on it)
- [ ] On export hide photo selector
- [ ] Drag and drop upload visual feedback not showing properly on drag
- [ ] ... The list, like the show, must go on

----

## TODOS ##

- [ ] Responsive
- [ ] Create a button to clear search input
- [ ] Create buttons to remove elements (one by one), from the panel and from the Canvas
- [ ] Option for canvas background and size export
- [ ] ... Again the list must go on

----

## NOTES ##

I've used Next because, combined with Tailwind, as they speedup the process of starting a project (granted, sometimes React can be a pain in the butt to make some simple things working). For the UI I've used existing styles from Flowbite, looks modern (and generic, but it works, for now).

For the speed and easy process I didn't split the files as much as I'd like otherwise I should have had a store manager (such as Zustand), the overall process would have been way cleaner but also heavier on the logic, this project was also kind of a discovery for me, so I went K.I.S.S. on this one.

I've used lib Konva for the canvas interactions as it checked all the boxes for the exercise and still maintained (last PR was 2 weeks ago) and has almost 10k stars on Github.

Took me about 4-5 hours to do that (I know, I just shot myself in the foot admitting that, but hey at least I'm honest lol). In the 2 hours mark I had everything done from the panel and the canvas was ready to take datas, but no interaction was present between them, and the canvas lacked any kind of interactivity. It's my first time playing with canvas, never used them before, it's pretty fun and I might continue this project just for the sake of learning.

Hope it turns out OK, in any case, thank you!

Dario Lopes