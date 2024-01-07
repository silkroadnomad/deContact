import protobuf from "protobufjs";

export const AddressCardMessage = new protobuf.Type("AddressCardMessage")
    .add(new protobuf.Field("timestamp", 1, "uint64"))
    .add(new protobuf.Field("command", 2, "string"))
    .add(new protobuf.Field("sender", 3, "string"))
    .add(new protobuf.Field("recipient", 4, "string"))
    .add(new protobuf.Field("data", 5, "string"));