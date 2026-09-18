# FlyMate — are you smarter than a fly?

Play chess against the complete FlyWire fruit-fly connectome — 138,639 neurons, 15,091,983
synapses, wired exactly as reconstructed — running on your own GPU in one browser tab.

**Play:** https://flymate.naklitechie.com

Only an encoder, one positive gain per synapse, per-neuron homeostasis and a decoder were
trained (on Stockfish-annotated Lichess positions); the wiring and its excitatory/inhibitory
signs are the fly's. The network recovers Stockfish's top move 29.8% of the time on held-out
positions (ChessFly, the original recipe by Maxime Labonne: 30.4%) — 3 epochs on 4.4M Lichess
positions with soft multi-PV policy targets. In the browser the fly searches
three plies ahead (its moves, the opponent's best replies by policy, its own answers), pushing
every position through the whole brain in batched passes; the search width adapts to the GPU
so a move takes about 3 s. It has beaten Stockfish skill 1 from the app.

## How it works
- `index.html` is the entire app: WebGPU compute shaders do a CSR sparse matrix–vector settle
  over the 15.1M synapses (5 steps), the encoder, the decoder and the heads; chess.js handles the
  rules. On load, the GPU output is checked against torch reference outputs for four positions and
  the page refuses to play if they disagree.
- Weights (159 MB) are fetched from [naklitechie/flymate-chess](https://huggingface.co/naklitechie/flymate-chess)
  on Hugging Face and cached in the browser. `?weights=local` reads `./weights/chess/` instead.
- Training code, the connectome packing, and the exporter: [NakliTechie/gofly](https://github.com/NakliTechie/gofly)
  (`web/export.py` writes the bundle).

## Go
`go.html` — the same brain trained on 9×9 Go (KataGo g170 self-play labels, CC0) with a
**retinotopic** encoder: each board point drives the ~130 photoreceptors beneath it on the fly's
eyes. Held-out: 30.1% agreement with KataGo's most-visited move (random 3.5%), 74.9% final-ownership
accuracy per point (coin flip 50%); the value head never learned, so the fly plays on policy alone
and its territory estimate is drawn on the board. Weights:
[naklitechie/flymate-go](https://huggingface.co/naklitechie/flymate-go) (graph files shared with
the chess bundle, so a chess visitor downloads only 79 MB more). Rules: area scoring, komi 7,
simple ko, no suicide.

## Credits and licence
Recipe: [ChessFly](https://huggingface.co/mlabonne/chessfly) (Maxime Labonne). Connectome:
FlyWire FAFB v783 — Dorkenwald et al. 2024, Schlegel et al. 2024, signs from Shiu et al. 2024;
FlyWire's non-commercial terms apply to anything derived from the graph. Labels: Lichess
evaluations (CC0). Code in this repo: MIT.
