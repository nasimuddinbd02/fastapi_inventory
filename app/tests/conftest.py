import sys
import types
import json


def _ensure_module(name):
    if name in sys.modules:
        return sys.modules[name]
    mod = types.ModuleType(name)
    sys.modules[name] = mod
    return mod


# Create lightweight dummy modules to avoid import-time failures when LLM libs
# are not installed or when tests should run offline.
_ensure_module("langgraph")
lg_graph = _ensure_module("langgraph.graph")


class _DummyCompiledWorkflow:
    async def ainvoke(self, state):
        return state


class StateGraph:
    def __init__(self, *args, **kwargs):
        pass

    def add_node(self, *a, **k):
        return None

    def set_entry_point(self, *a, **k):
        return None

    def add_edge(self, *a, **k):
        return None

    def compile(self):
        return _DummyCompiledWorkflow()


lg_graph.StateGraph = StateGraph
lg_graph.END = object()


_ensure_module("langchain_openai")
lco = _ensure_module("langchain_openai")


class ChatOpenAI:
    def __init__(self, *args, **kwargs):
        pass

    def invoke(self, messages):
        class Resp:
            content = json.dumps({})

        return Resp()


lco.ChatOpenAI = ChatOpenAI


_ensure_module("langchain_core")
_ensure_module("langchain_core.messages")
_ensure_module("langchain_core.output_parsers")

from types import SimpleNamespace


class HumanMessage:
    def __init__(self, content=""):
        self.content = content


class JsonOutputParser:
    def parse(self, content):
        try:
            return json.loads(content)
        except Exception:
            return {}


sys.modules["langchain_core.messages"].HumanMessage = HumanMessage
sys.modules["langchain_core.output_parsers"].JsonOutputParser = JsonOutputParser


# Provide a minimal `automapper` module with `Mapper` class used by mappers
_ensure_module("automapper")
am = _ensure_module("automapper")


class Mapper:
    def __init__(self, *args, **kwargs):
        pass


am.Mapper = Mapper
