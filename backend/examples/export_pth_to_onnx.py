import argparse

import torch


def load_model(checkpoint_path: str):
    """
    Replace this function with your real model class and checkpoint-loading logic.
    Example:
        from my_model import IntrusionNet
        model = IntrusionNet()
        model.load_state_dict(torch.load(checkpoint_path, map_location="cpu"))
        return model.eval()
    """
    raise NotImplementedError("Update load_model() with your actual PyTorch model definition.")


def main():
    parser = argparse.ArgumentParser(description="Export a PyTorch .pth checkpoint to ONNX.")
    parser.add_argument("--checkpoint", required=True, help="Path to the .pth file")
    parser.add_argument("--output", required=True, help="Destination .onnx file path")
    parser.add_argument("--input-size", type=int, required=True, help="Number of input features")
    parser.add_argument("--opset", type=int, default=17)
    args = parser.parse_args()

    model = load_model(args.checkpoint)
    dummy_input = torch.randn(1, args.input_size, dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy_input,
        args.output,
        export_params=True,
        opset_version=args.opset,
        do_constant_folding=True,
        input_names=["features"],
        output_names=["scores"],
        dynamic_axes={
            "features": {0: "batch_size"},
            "scores": {0: "batch_size"},
        },
    )

    print(f"Exported ONNX model to {args.output}")


if __name__ == "__main__":
    main()
