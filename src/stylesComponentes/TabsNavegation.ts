import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    paddingBottom: 12,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: "#f4511e",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
