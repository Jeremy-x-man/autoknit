#include <napi.h>
#include <vector>
#include <string>

// Declare the main functions
extern int schedule_main(int argc, char **argv);
extern int interface_main(int argc, char **argv);

Napi::Value RunSchedule(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of strings as arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array argsArray = info[0].As<Napi::Array>();
    uint32_t length = argsArray.Length();

    std::vector<std::string> argsStr;
    argsStr.push_back("schedule"); // Dummy program name

    for (uint32_t i = 0; i < length; i++) {
        Napi::Value val = argsArray[i];
        if (val.IsString()) {
            argsStr.push_back(val.As<Napi::String>().Utf8Value());
        }
    }

    std::vector<char*> argv;
    for (size_t i = 0; i < argsStr.size(); ++i) {
        argv.push_back(const_cast<char*>(argsStr[i].c_str()));
    }

    int result = 0;
    try {
        result = schedule_main(argv.size(), argv.data());
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    } catch (...) {
        Napi::Error::New(env, "Unknown error occurred during schedule").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Number::New(env, result);
}

Napi::Value RunInterface(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of strings as arguments").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array argsArray = info[0].As<Napi::Array>();
    uint32_t length = argsArray.Length();

    std::vector<std::string> argsStr;
    argsStr.push_back("interface"); // Dummy program name

    for (uint32_t i = 0; i < length; i++) {
        Napi::Value val = argsArray[i];
        if (val.IsString()) {
            argsStr.push_back(val.As<Napi::String>().Utf8Value());
        }
    }

    std::vector<char*> argv;
    for (size_t i = 0; i < argsStr.size(); ++i) {
        argv.push_back(const_cast<char*>(argsStr[i].c_str()));
    }

    int result = 0;
    try {
        result = interface_main(argv.size(), argv.data());
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    } catch (...) {
        Napi::Error::New(env, "Unknown error occurred during interface").ThrowAsJavaScriptException();
        return env.Null();
    }

    return Napi::Number::New(env, result);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "schedule"), Napi::Function::New(env, RunSchedule));
    exports.Set(Napi::String::New(env, "interface"), Napi::Function::New(env, RunInterface));
    return exports;
}

NODE_API_MODULE(autoknit_node, Init)
