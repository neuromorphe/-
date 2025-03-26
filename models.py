from g4f.Provider import DDG, TypeGPT, PollinationsAI

MODELS = {
    "gpt-4o-mini": {
        "provider": PollinationsAI,
        "description": "Модель GPT-4o Mini с поддержкой текстовых запросов и машинного зрения.",
        "supports_vision": True
    },
    "llama-3.3-70b": {
        "provider": DDG,
        "description": "Модель Llama 3.3 70B с поддержкой текстовых запросов.",
        "supports_vision": False
    },
    "o1-mini": {
        "provider": TypeGPT,
        "description": "Модель OpenAI o1 Mini с поддержкой текстовых запросов и машинного зрения.",
        "supports_vision": True
    }
}