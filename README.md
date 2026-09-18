# FlyMate — are you smarter than a fly?

Play chess against the complete FlyWire fruit-fly connectome — 138,639 neurons, 15,091,983
synapses, wired exactly as reconstructed — running on your own GPU in one browser tab.

**Play:** https://flymate.naklitechie.com

Only an encoder, one positive gain per synapse, per-neuron homeostasis and a decoder were
trained (on Stockfish-annotated Lichess positions); the wiring and its excitatory/inhibitory
signs are the fly's. The network recovers Stockfish's top move 28.3% of the time on held-out
positions (ChessFly, the original recipe by Maxime Labonne: 30.4%). In the browser the fly looks
one move ahead by pushing every reply through the whole brain in a single batched pass.

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
The same brain, trained on 9×9 Go with a retinotopic encoder, lands here next.

## Credits and licence
Recipe: [ChessFly](https://huggingface.co/mlabonne/chessfly) (Maxime Labonne). Connectome:
FlyWire FAFB v783 — Dorkenwald et al. 2024, Schlegel et al. 2024, signs from Shiu et al. 2024;
FlyWire's non-commercial terms apply to anything derived from the graph. Labels: Lichess
evaluations (CC0). Code in this repo: MIT.
