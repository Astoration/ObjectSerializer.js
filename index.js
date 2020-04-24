'use strict';

var bytebuffer = require('bytebuffer')


var objectSerializer = {
    deserialize: (payload, schema) => {
        let buffer = bytebuffer.wrap(new Uint8Array(payload));
        let result = Object.assign({}, schema);
        for(var key in schema){
            switch(schema[key]){
                case 'double':
                    result[key] = buffer.readDouble();
                    break;
                case 'int':
                    result[key] = buffer.readInt();
                    break;
                case 'string':
                    let count = buffer.readInt();
                    result[key] = buffer.readUTF8String(count);
                    break;
                case 'boolean':
                    result[key] = buffer.readByte() == 1;
                    break;
            }
        }
        return result;
    },
    serialize: (object, schema) => {
        let result = new bytebuffer();
        let data;
        let index = 0;
        let offset = 0;
        let dataEnd = false;
        if(object.length != null){
            offset += 32;
            result.writeInt(object.length);
        }else{
            dataEnd = true;   
        }
        do{
            if(object.length != null){
                if(index < object.length){
                    data = object[index++];
                }else{
                    dataEnd = true;
                    return result.toBase64(0,offset);
                }
            }else{
                data = object;
                dataEnd = true;
            }
            for(var key in schema){
                switch(schema[key]){
                    case 'double':
                        offset += 64;
                        result.writeDouble(data[key] || 0);
                        break;
                    case 'int':
                        offset += 32;
                        result.writeInt(data[key] || 0);
                        break;
                    case 'string':
                        let size = bytebuffer.calculateUTF8Bytes(data[key]);
                        result.writeInt(size || 0);
                        offset += 32;
                        result.writeUTF8String(data[key]);
                        offset += size;
                        break;
                    case 'boolean':
                        offset += 8;
                        result.writeByte(data[key] ? 1 : 0);
                        break;
                }
            }
        }while(!dataEnd)
        return result.toBase64(0,offset);
    }
}

module.export = objectSerializer;
