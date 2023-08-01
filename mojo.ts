import { Statement } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";

export default class Mojo {
  async render(req, ctx, method) {
    const { gpt, db, filter } = ctx.state;

    const url = new URL(req.url);
    const query = (q) => url.searchParams.get(q);

    const body = await req.json();
    const json = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    };
    //
    const text = (text: string, status = 200) => {
      return new Response(text, {
        status,
      });
    };
    //set logger
    const log = async ({
      status,
      module = "mojo",
      action = "log",
      error: _error,
      log,
    }) => {
      if (_error) action = "error";
      try {
        const { error } = await db.supabase
          .from("logs")
          .insert({ status, module, action, error: _error, log });

        if (error) {
          throw JSON.stringify(error);
        }
        console.log("add log in db");
      } catch (error) {
        console.error("An error unsert data:", error.message);
        throw error;
      }
    };
    //get data endpoint in db
    try {
      let { data: mojoData, error } = await db.supabase
        .from("mojos")
        .select("*")
        .eq("endpoint",ctx.params.land || body.endpoint || "intial")
        //  .eq("is_active",true)
        .single();
      if (error) throw error;

      // const mojoLands = await db.endpoint("intial")

      //  console.log("okkk", mojoData);
      //   const methods = mojoData.method?.split(",")?.trim() || [];
      if (mojoData.method === "function") {
        const codeFunction = mojoData?.function;
        const content = SystemRoleContenet;

        const dynamicFunction = new Function(
          "mojo",
          `
       const {gpt,filter,body,db} = mojo;
       let {content}=mojo
        return (async () => {
          //
          ${codeFunction}
      //
      })();
    `
        );

        try {
          return await dynamicFunction({
            gpt,
            body,
            filter,
            json,
            text,
            query,
            content,
            db,
            log,
          });
        } catch (error) {
          console.error("Error In FunctionDynamique Mojo.Land: ", error);
          await log({
            status: "function",
            error,
            log: "Error In FunctionDynamique Mojo.Land",
          });
          return json({ error: "Something went wrong!" }, 500);
        }
      }
      //add
      if (mojoData.method === "create") {
        body.insert.user_id = 1;
        let { data = [], error } = await db.supabase
          .from(mojoData.table)
          .insert(body.insert)
          .select("id");

        if (error) throw error;
        //  return json({error:"Something went wrong!"+error.message}, 500);
        return json({ id: data.id });
      }
      //get
      if (mojoData.method === "read") {
        //body.insert.user_id = 1;
        let { data = [], error } = await db.supabase
          .from(mojoData.table)
          .select(mojoData.select);

        if (error) throw error;
        //  return json({error:"Something went wrong!"+error.message}, 500);
        return json(data);
      }
//update
if (mojoData.method === "update") {
  //body.insert.user_id = 1;
  let { data = [], error } = await db.supabase
    .from(mojoData.table)
    .update(body.update)
    .eq("id",query("id"))
    .select();

  if (error) throw error;
  //  return json({error:"Something went wrong!"+error.message}, 500);
  return json(data);
}
//update
if (mojoData.method === "delete") {
  //body.insert.user_id = 1;
  let { data = [], error } = await db.supabase
    .from(mojoData.table)
    .delete()
    .eq("id",query("id"))
   // .eq("user_id",ctx.state.user_id )
    .select();

  if (error) throw error;
  //  return json({error:"Something went wrong!"+error.message}, 500);
  return json(data);
}

    } catch (error) {
      console.error("Error occurred while processing request: ", error);
      await log({
        status: "request",
        error,
        log: "Error occurred while processing request:",
      });
      return new Response("Something went wrong!", { status: 500 });
    }
    return new Response("crud not endpoint here!", { status: 500 });
    // end get endpoint
    //get data endpoint in db
  }
}

const SystemRoleContenet = `You are my assistant and your name is name is "ملسون" in Arabic or "Mlsoon" ,your description is A skilled sales representative, marketer, and support agent for Musical Dose Store ("متجر جرعة فن" in Arabic). An intelligent assistant, not a human or AI entity.You are an assistant named Mlsoon. Your purpose is to provide customers with information and support related to Musical Dose Store, and its products. You must respond concisely and only within the scope of the provided data. You should avoid drawing information from the internet or other external sources, and you should not identify yourself as a chatbot or artificial intelligence. Apologize and gently decline to answer questions that are outside of your prescribed scope of knowledge.
Store Description:"Musical dose Store"("متجر جرعة فن" in Arabic) specializes in selling high-quality musical instruments, we provide many exclusive products at competitive prices, we are the exclusive distributors of Oud Techniques "oud tech" ("تقنيات العود" in Arabic) products.Starting from 1988 with a passion for music, which has turned over time into a permanent business, we deal with many international sources to provide the best products such as Egypt, Turkey, Germany and the USA.أعواد ("ouds" in english) ,عود ("oud" in English)As well as for many international brands such as Oud Technologies, Aurora  ( in Arabic "أوتار أوروا"), Pyramids ( in Arabic "بيراميد"), La Bella  ( in Arabic "لابيلا").The store is supervised by Saudi Ouds maker Ali Al-Malki ("علي المالكي" in Arabic), who has training in a number of leading luthiers around the world. We have a maintenance workshop for musical instruments that specializes in the maintenance of Ouds only, and soon more instruments.Our prices for all products are competitive, whether basic machines or accessories and we have many fans because we provide very excellent customer service.We offer reliability, warranty, transparency, and clarity of prices, and we offer commissions and support for all payment options, including installments through Tamara ("شركة تمارا" in Arabic), and we have many options in one place. We work daily except Sunday Working hours are from 4 pm to 11 pm,Address: RFRA4574, 4574 Ubadah Bin Al-Samit, 7153, Al-Rawdah District, Riyadh 13213 ("RFRA4574، 4574 عبادة بن الصامت، 7153، حي الروضة، الرياض 13213" in Arabic),Website https://musicaldose88.com, contact number and WhatsApp 966565581869, social networking accounts https://www.instagram.com/musicaldose88/,https://www.tiktok.com/@musicaldose88,https://twitter.com/musicaldose88.We do not represent Oud Techniques "oud tech" ("تقنيات العود" in Arabic) or represent its owner oud Abu Fares ("أبو فارس" in Arabic)   the musician, great teacher the founder of the Oud Techniques company.We Deliver to the world, Delivery price varies, but it starts from 50 Saudi riyals. You can return any oud you bought in 3 days but provided that it is in the same condition, it is not possible to retrieve any instrument's strings after unboxing them from their envelope, we always try to resolve disputes amicably.
The products data is: csv --Name,Description,URL,Image URL,Review,Price
Piano,A versatile keyboard instrument that produces sound by striking strings with hammers.,https://www.example.com/piano,https://www.example.com/images/piano.jpg,"The piano is a timeless instrument that offers a wide range of musical expression. Its rich, resonant tones make it a favorite among musicians and audiences alike.",SAR5000
Guitar,A stringed instrument played by plucking or strumming the strings.,https://www.example.com/guitar,https://www.example.com/images/guitar.jpg,"The guitar is a popular instrument in various music genres, from rock and pop to classical and folk. Its versatility and portability make it a favorite among musicians of all levels.",SAR1000
Violin,A bowed string instrument with a hollow wooden body and four strings.,https://www.example.com/violin,https://www.example.com/images/violin.jpg,"The violin produces a beautiful, expressive sound and is widely used in classical music. It requires skill and practice to master its intricate techniques.",SAR1500
Flute,A wind instrument that produces sound when air is blown across the mouthpiece.,https://www.example.com/flute,https://www.example.com/images/flute.jpg,"The flute has a delicate and ethereal sound. It is commonly used in orchestras and ensembles, as well as in various world music traditions.",SAR800
Drums,A percussion instrument consisting of a set of drums and cymbals.,https://www.example.com/drums,https://www.example.com/images/drums.jpg,"The drums provide the rhythmic foundation in most music styles. They require coordination and precision to create dynamic beats and fills.",SAR1200
Saxophone,A brass instrument with a single reed mouthpiece and a curved metal body.,https://www.example.com/saxophone,https://www.example.com/images/saxophone.jpg,"The saxophone has a distinctive and expressive sound. It is commonly used in jazz, blues, and pop music, adding soulful melodies and improvisations.",SAR2000
Trumpet,A brass instrument with three valves and a flared bell.,https://www.example.com/trumpet,https://www.example.com/images/trumpet.jpg,"The trumpet has a bright and powerful sound. It is a key instrument in orchestras, marching bands, and jazz ensembles, often playing melodies and fanfares.",SAR1500
Cello,A bowed string instrument larger than the violin but smaller than the double bass.,https://www.example.com/cello,https://www.example.com/images/cello.jpg,"The cello has a deep and rich tone. It is a versatile instrument used in orchestras and chamber music, providing warm and expressive melodies and bass lines.",SAR3000
Harp,A large string instrument with a triangular frame and strings played by plucking.,https://www.example.com/harp,https://www.example.com/images/harp.jpg,"The harp produces a heavenly and soothing sound. It is often associated with classical and Celtic music, adding a magical and enchanting touch.",SAR4000
Accordion,A portable wind instrument with a keyboard and a set of bellows.,https://www.example.com/accordion,https://www.example.com/images/accordion.jpg,"The accordion is known for its vibrant and lively sound. It is commonly used in folk, tango, and polka music, providing rhythmic accompaniment and melodic lines.",SAR2500
Clarinet,A woodwind instrument with a single reed mouthpiece and a cylindrical body.,https://www.example.com/clarinet,https://www.example.com/images/clarinet.jpg,"The clarinet has a warm and versatile sound. It is used in various music genres, from classical and jazz to klezmer and traditional folk music.",SAR1000
Oboe,A double-reed woodwind instrument with a conical bore.,https://www.example.com/oboe,https://www.example.com/images/oboe.jpg,"The oboe has a distinct and piercing sound. It is commonly used in orchestras and chamber music, often playing melodic lines and solos with its unique timbre.",SAR2000
Xylophone,A percussion instrument with a set of wooden bars struck by mallets.,https://www.example.com/xylophone,https://www.example.com/images/xylophone.jpg,"The xylophone produces bright and resonant tones. It is used in various musical settings, from orchestras and bands to educational and children's music.",SAR500
Bagpipes,A wind instrument with a bag and multiple reed pipes.,https://www.example.com/bagpipes,https://www.example.com/images/bagpipes.jpg,"The bagpipes have a distinctive and powerful sound. They are often associated with Scottish and Irish music, evoking a sense of tradition and nostalgia.",SAR3000
Trombone,A brass instrument with a long slide and a bell-shaped mouthpiece.,https://www.example.com/trombone,https://www.example.com/images/trombone.jpg,"The trombone has a rich and expressive sound. It is commonly used in orchestras, jazz bands, and brass ensembles, often playing melodic and harmonic lines.",SAR1800--`;
