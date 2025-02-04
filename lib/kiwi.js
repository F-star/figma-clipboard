"use strict";
var kiwi = (()=>{
    var u = (a,t)=>()=>(a && (t = a(a = 0)),
    t);
    var v = (a,t)=>()=>(t || a((t = {
        exports: {}
    }).exports, t),
    t.exports);
    var f, g, d, b = u(()=>{
        "use strict";
        f = new Int32Array(1),
        g = new Float32Array(f.buffer),
        d = class {
            constructor(t) {
                if (t && !(t instanceof Uint8Array))
                    throw new Error("Must initialize a ByteBuffer with a Uint8Array");
                this._data = t || new Uint8Array(256),
                this._index = 0,
                this.length = t ? t.length : 0
            }
            toUint8Array() {
                return this._data.subarray(0, this.length)
            }
            readByte() {
                if (this._index + 1 > this._data.length)
                    throw new Error("Index out of bounds");
                return this._data[this._index++]
            }
            readByteArray() {
                let t = this.readVarUint()
                  , e = this._index
                  , i = e + t;
                if (i > this._data.length)
                    throw new Error("Read array out of bounds");
                this._index = i;
                let n = new Uint8Array(t);
                return n.set(this._data.subarray(e, i)),
                n
            }
            readVarFloat() {
                let t = this._index
                  , e = this._data
                  , i = e.length;
                if (t + 1 > i)
                    throw new Error("Index out of bounds");
                let n = e[t];
                if (n === 0)
                    return this._index = t + 1,
                    0;
                if (t + 4 > i)
                    throw new Error("Index out of bounds");
                let r = n | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24;
                return this._index = t + 4,
                r = r << 23 | r >>> 9,
                f[0] = r,
                g[0]
            }
            readVarUint() {
                let t = 0
                  , e = 0;
                do {
                    var i = this.readByte();
                    t |= (i & 127) << e,
                    e += 7
                } while (i & 128 && e < 35);
                return t >>> 0
            }
            readVarInt() {
                let t = this.readVarUint() | 0;
                return t & 1 ? ~(t >>> 1) : t >>> 1
            }
            readVarUint64() {
                let t = BigInt(0), e = BigInt(0), i = BigInt(7), n;
                for (; (n = this.readByte()) & 128 && e < 56; )
                    t |= BigInt(n & 127) << e,
                    e += i;
                return t |= BigInt(n) << e,
                t
            }
            readVarInt64() {
                let t = this.readVarUint64()
                  , e = BigInt(1)
                  , i = t & e;
                return t >>= e,
                i ? ~t : t
            }
            readString() {
                let t = "";
                for (; ; ) {
                    let e, i = this.readByte();
                    if (i < 192)
                        e = i;
                    else {
                        let n = this.readByte();
                        if (i < 224)
                            e = (i & 31) << 6 | n & 63;
                        else {
                            let r = this.readByte();
                            if (i < 240)
                                e = (i & 15) << 12 | (n & 63) << 6 | r & 63;
                            else {
                                let s = this.readByte();
                                e = (i & 7) << 18 | (n & 63) << 12 | (r & 63) << 6 | s & 63
                            }
                        }
                    }
                    if (e === 0)
                        break;
                    e < 65536 ? t += String.fromCharCode(e) : (e -= 65536,
                    t += String.fromCharCode((e >> 10) + 55296, (e & 1024 - 1) + 56320))
                }
                return t
            }
            _growBy(t) {
                if (this.length + t > this._data.length) {
                    let e = new Uint8Array(this.length + t << 1);
                    e.set(this._data),
                    this._data = e
                }
                this.length += t
            }
            writeByte(t) {
                let e = this.length;
                this._growBy(1),
                this._data[e] = t
            }
            writeByteArray(t) {
                this.writeVarUint(t.length);
                let e = this.length;
                this._growBy(t.length),
                this._data.set(t, e)
            }
            writeVarFloat(t) {
                let e = this.length;
                g[0] = t;
                let i = f[0];
                if (i = i >>> 23 | i << 9,
                !(i & 255)) {
                    this.writeByte(0);
                    return
                }
                this._growBy(4);
                let n = this._data;
                n[e] = i,
                n[e + 1] = i >> 8,
                n[e + 2] = i >> 16,
                n[e + 3] = i >> 24
            }
            writeVarUint(t) {
                if (t < 0 || t > 4294967295)
                    throw new Error("Outside uint range: " + t);
                do {
                    let e = t & 127;
                    t >>>= 7,
                    this.writeByte(t ? e | 128 : e)
                } while (t)
            }
            writeVarInt(t) {
                if (t < -2147483648 || t > 2147483647)
                    throw new Error("Outside int range: " + t);
                this.writeVarUint((t << 1 ^ t >> 31) >>> 0)
            }
            writeVarUint64(t) {
                if (typeof t == "string")
                    t = BigInt(t);
                else if (typeof t != "bigint")
                    throw new Error("Expected bigint but got " + typeof t + ": " + t);
                if (t < 0 || t > BigInt("0xFFFFFFFFFFFFFFFF"))
                    throw new Error("Outside uint64 range: " + t);
                let e = BigInt(127)
                  , i = BigInt(7);
                for (let n = 0; t > e && n < 8; n++)
                    this.writeByte(Number(t & e) | 128),
                    t >>= i;
                this.writeByte(Number(t))
            }
            writeVarInt64(t) {
                if (typeof t == "string")
                    t = BigInt(t);
                else if (typeof t != "bigint")
                    throw new Error("Expected bigint but got " + typeof t + ": " + t);
                if (t < -BigInt("0x8000000000000000") || t > BigInt("0x7FFFFFFFFFFFFFFF"))
                    throw new Error("Outside int64 range: " + t);
                let e = BigInt(1);
                this.writeVarUint64(t < 0 ? ~(t << e) : t << e)
            }
            writeString(t) {
                let e;
                for (let i = 0; i < t.length; i++) {
                    let n = t.charCodeAt(i);
                    if (i + 1 === t.length || n < 55296 || n >= 56320)
                        e = n;
                    else {
                        let r = t.charCodeAt(++i);
                        e = (n << 10) + r + (65536 - 56623104 - 56320)
                    }
                    if (e === 0)
                        throw new Error("Cannot encode a string containing the null character");
                    e < 128 ? this.writeByte(e) : (e < 2048 ? this.writeByte(e >> 6 & 31 | 192) : (e < 65536 ? this.writeByte(e >> 12 & 15 | 224) : (this.writeByte(e >> 18 & 7 | 240),
                    this.writeByte(e >> 12 & 63 | 128)),
                    this.writeByte(e >> 6 & 63 | 128)),
                    this.writeByte(e & 63 | 128))
                }
                this.writeByte(0)
            }
        }
    }
    );
    function m(a) {
        let t = a instanceof d ? a : new d(a)
          , e = t.readVarUint()
          , i = [];
        for (let n = 0; n < e; n++) {
            let r = t.readString()
              , s = t.readByte()
              , h = t.readVarUint()
              , o = [];
            for (let y = 0; y < h; y++) {
                let S = t.readString()
                  , V = t.readVarInt()
                  , k = !!(t.readByte() & 1)
                  , A = t.readVarUint();
                o.push({
                    name: S,
                    line: 0,
                    column: 0,
                    type: c[s] === "ENUM" ? null : V,
                    isArray: k,
                    isDeprecated: !1,
                    value: A
                })
            }
            i.push({
                name: r,
                line: 0,
                column: 0,
                kind: c[s],
                fields: o
            })
        }
        for (let n = 0; n < e; n++) {
            let r = i[n].fields;
            for (let s = 0; s < r.length; s++) {
                let h = r[s]
                  , o = h.type;
                if (o !== null && o < 0) {
                    if (~o >= w.length)
                        throw new Error("Invalid type " + o);
                    h.type = w[~o]
                } else {
                    if (o !== null && o >= i.length)
                        throw new Error("Invalid type " + o);
                    h.type = o === null ? null : i[o].name
                }
            }
        }
        return {
            package: null,
            definitions: i
        }
    }
    var w, c, x = u(()=>{
        "use strict";
        b();
        w = ["bool", "byte", "int", "uint", "float", "string", "int64", "uint64"],
        c = ["ENUM", "STRUCT", "MESSAGE"]
    }
    );
    function l(a) {
        return JSON.stringify(a)
    }
    function p(a, t, e) {
        var i = new Error(a);
        throw i.line = t,
        i.column = e,
        i
    }
    var B = u(()=>{
        "use strict"
    }
    );
    function I(a, t) {
        let e = []
          , i = "  ";
        e.push("function (bb) {"),
        e.push("  var result = {};"),
        e.push("  if (!(bb instanceof this.ByteBuffer)) {"),
        e.push("    bb = new this.ByteBuffer(bb);"),
        e.push("  }"),
        e.push(""),
        a.kind === "MESSAGE" && (e.push("  while (true) {"),
        e.push("    switch (bb.readVarUint()) {"),
        e.push("      case 0:"),
        e.push("        return result;"),
        e.push(""),
        i = "        ");
        for (let n = 0; n < a.fields.length; n++) {
            let r = a.fields[n], s;
            switch (r.type) {
            case "bool":
                {
                    s = "!!bb.readByte()";
                    break
                }
            case "byte":
                {
                    s = "bb.readByte()";
                    break
                }
            case "int":
                {
                    s = "bb.readVarInt()";
                    break
                }
            case "uint":
                {
                    s = "bb.readVarUint()";
                    break
                }
            case "float":
                {
                    s = "bb.readVarFloat()";
                    break
                }
            case "string":
                {
                    s = "bb.readString()";
                    break
                }
            case "int64":
                {
                    s = "bb.readVarInt64()";
                    break
                }
            case "uint64":
                {
                    s = "bb.readVarUint64()";
                    break
                }
            default:
                {
                    let h = t[r.type];
                    h ? h.kind === "ENUM" ? s = "this[" + l(h.name) + "][bb.readVarUint()]" : s = "this[" + l("decode" + h.name) + "](bb)" : p("Invalid type " + l(r.type) + " for field " + l(r.name), r.line, r.column)
                }
            }
            a.kind === "MESSAGE" && e.push("      case " + r.value + ":"),
            r.isArray ? r.isDeprecated ? r.type === "byte" ? e.push(i + "bb.readByteArray();") : (e.push(i + "var length = bb.readVarUint();"),
            e.push(i + "while (length-- > 0) " + s + ";")) : r.type === "byte" ? e.push(i + "result[" + l(r.name) + "] = bb.readByteArray();") : (e.push(i + "var length = bb.readVarUint();"),
            e.push(i + "var values = result[" + l(r.name) + "] = Array(length);"),
            e.push(i + "for (var i = 0; i < length; i++) values[i] = " + s + ";")) : r.isDeprecated ? e.push(i + s + ";") : e.push(i + "result[" + l(r.name) + "] = " + s + ";"),
            a.kind === "MESSAGE" && (e.push("        break;"),
            e.push(""))
        }
        return a.kind === "MESSAGE" ? (e.push("      default:"),
        e.push('        throw new Error("Attempted to parse invalid message");'),
        e.push("    }"),
        e.push("  }")) : e.push("  return result;"),
        e.push("}"),
        e.join(`
`)
    }
    function _(a, t) {
        let e = [];
        e.push("function (message, bb) {"),
        e.push("  var isTopLevel = !bb;"),
        e.push("  if (isTopLevel) bb = new this.ByteBuffer();");
        for (let i = 0; i < a.fields.length; i++) {
            let n = a.fields[i], r;
            if (!n.isDeprecated) {
                switch (n.type) {
                case "bool":
                    {
                        r = "bb.writeByte(value);";
                        break
                    }
                case "byte":
                    {
                        r = "bb.writeByte(value);";
                        break
                    }
                case "int":
                    {
                        r = "bb.writeVarInt(value);";
                        break
                    }
                case "uint":
                    {
                        r = "bb.writeVarUint(value);";
                        break
                    }
                case "float":
                    {
                        r = "bb.writeVarFloat(value);";
                        break
                    }
                case "string":
                    {
                        r = "bb.writeString(value);";
                        break
                    }
                case "int64":
                    {
                        r = "bb.writeVarInt64(value);";
                        break
                    }
                case "uint64":
                    {
                        r = "bb.writeVarUint64(value);";
                        break
                    }
                default:
                    {
                        let s = t[n.type];
                        if (s)
                            s.kind === "ENUM" ? r = "var encoded = this[" + l(s.name) + '][value]; if (encoded === void 0) throw new Error("Invalid value " + JSON.stringify(value) + ' + l(" for enum " + l(s.name)) + "); bb.writeVarUint(encoded);" : r = "this[" + l("encode" + s.name) + "](value, bb);";
                        else
                            throw new Error("Invalid type " + l(n.type) + " for field " + l(n.name))
                    }
                }
                e.push(""),
                e.push("  var value = message[" + l(n.name) + "];"),
                e.push("  if (value != null) {"),
                a.kind === "MESSAGE" && e.push("    bb.writeVarUint(" + n.value + ");"),
                n.isArray ? n.type === "byte" ? e.push("    bb.writeByteArray(value);") : (e.push("    var values = value, n = values.length;"),
                e.push("    bb.writeVarUint(n);"),
                e.push("    for (var i = 0; i < n; i++) {"),
                e.push("      value = values[i];"),
                e.push("      " + r),
                e.push("    }")) : e.push("    " + r),
                a.kind === "STRUCT" && (e.push("  } else {"),
                e.push("    throw new Error(" + l("Missing required field " + l(n.name)) + ");")),
                e.push("  }")
            }
        }
        return a.kind === "MESSAGE" && e.push("  bb.writeVarUint(0);"),
        e.push(""),
        e.push("  if (isTopLevel) return bb.toUint8Array();"),
        e.push("}"),
        e.join(`
`)
    }
    function D(a) {
        let t = {}
          , e = a.package
          , i = [];
        e !== null ? i.push("var " + e + " = exports || " + e + " || {}, exports;") : (i.push("var exports = exports || {};"),
        e = "exports"),
        i.push(e + ".ByteBuffer = " + e + '.ByteBuffer || require("kiwi-schema").ByteBuffer;');
        for (let n = 0; n < a.definitions.length; n++) {
            let r = a.definitions[n];
            t[r.name] = r
        }
        for (let n = 0; n < a.definitions.length; n++) {
            let r = a.definitions[n];
            switch (r.kind) {
            case "ENUM":
                {
                    let s = {};
                    for (let h = 0; h < r.fields.length; h++) {
                        let o = r.fields[h];
                        s[o.name] = o.value,
                        s[o.value] = o.name
                    }
                    i.push(e + "[" + l(r.name) + "] = " + JSON.stringify(s, null, 2) + ";");
                    break
                }
            case "STRUCT":
            case "MESSAGE":
                {
                    i.push(""),
                    i.push(e + "[" + l("decode" + r.name) + "] = " + I(r, t) + ";"),
                    i.push(""),
                    i.push(e + "[" + l("encode" + r.name) + "] = " + _(r, t) + ";");
                    break
                }
            default:
                {
                    p("Invalid definition kind " + l(r.kind), r.line, r.column);
                    break
                }
            }
        }
        return i.push(""),
        i.join(`
`)
    }
    function F(a) {
        let t = {
            ByteBuffer: d
        };
        return new Function("exports",D(a))(t),
        t
    }
    var U = u(()=>{
        "use strict";
        b();
        B()
    }
    );
    var C = v((K,E)=>{
        x();
        U();
        E.exports = {
            decodeBinarySchema: m,
            compileSchema: F
        }
    }
    );
    return C();
}
)();
